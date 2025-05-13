import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { createOpenAI } from '@ai-sdk/openai';
import { convertToCoreMessages, smoothStream, streamText } from 'ai';
import { ResponseWrapper } from 'docs-hub-shared-models';
import request from '@/request';
import { getServiceHeader } from '@/lib/x-service-auth';
import { getToken } from '@/lib/token';

const CHUNKING_REGEXPS = {
	line: /\n+/m,
	list: /.{8}/m,
	word: /\S+\s+/m,
};

interface ModelData {
	providerName: string
	name: string
}

export async function POST(req: NextRequest) {
	const { apiKey: key, messages, model = 'gpt-4o', system } = await req.json();

	let modelData: ModelData;
	// 查询model对应的name
	try {
		const response = await request('/api/model/id', {
			headers: getServiceHeader(getToken(req)),
			method: 'post',
			body: JSON.stringify({
				modelIds: [model],
			}),
		});
		const { data } = await response.json();
		modelData = data[0];
	} catch (err) {
		return NextResponse.json(ResponseWrapper.error('model config error'), {
			status: 500,
		});
	}
	if (modelData?.providerName === 'ollama') {
		return await request('/api/chat', {
			headers: getServiceHeader(getToken(req)),
			method: 'post',
			body: JSON.stringify({
				messages,
				system,
				model: modelData.name,
				// model: 'deepseek-r1:7b',
			}),
		});
	}

	const apiKey = key || process.env.OPENAI_API_KEY;
	if (!apiKey) {
		return NextResponse.json(
			{ error: 'Missing OpenAI API key.' },
			{ status: 401 },
		);
	}

	const openai = createOpenAI({ apiKey });

	let isInCodeBlock = false;
	let isInTable = false;
	let isInList = false;
	let isInLink = false;
	try {
		const result = streamText({
			experimental_transform: smoothStream({
				chunking: (buffer) => {
					// Check for code block markers
					if (buffer.includes('```')) {
						isInCodeBlock = !isInCodeBlock;
					}

					// test case: should not deserialize link with markdown syntax
					if (buffer.includes('http')) {
						isInLink = true;
					} else if (buffer.includes('https')) {
						isInLink = true;
					} else if (buffer.includes('\n') && isInLink) {
						isInLink = false;
					}

					if (buffer.includes('*') || buffer.includes('-')) {
						isInList = true;
					} else if (buffer.includes('\n') && isInList) {
						isInList = false;
					}

					// Simple table detection: enter on |, exit on double newline
					if (!isInTable && buffer.includes('|')) {
						isInTable = true;
					} else if (isInTable && buffer.includes('\n\n')) {
						isInTable = false;
					}

					// Use line chunking for code blocks and tables, word chunking otherwise
					// Choose the appropriate chunking strategy based on content type
					let match;

					if (isInCodeBlock || isInTable || isInLink) {
						// Use line chunking for code blocks and tables
						match = CHUNKING_REGEXPS.line.exec(buffer);
					} else if (isInList) {
						// Use list chunking for lists
						match = CHUNKING_REGEXPS.list.exec(buffer);
					} else {
						// Use word chunking for regular text
						match = CHUNKING_REGEXPS.word.exec(buffer);
					}

					if (!match) {
						return null;
					}

					return buffer.slice(0, match.index) + match?.[0];
				},
			}),
			maxTokens: 2048,
			messages: convertToCoreMessages(messages),
			model: openai('gpt-4o'),
			system: system,
		});

		return result.toDataStreamResponse();
	} catch {
		return NextResponse.json(
			{ error: 'Failed to process AI request' },
			{ status: 500 },
		);
	}
}
