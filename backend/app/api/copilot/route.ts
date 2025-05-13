import type { NextRequest } from 'next/server';
import { createOpenAI } from '@ai-sdk/openai';
import { generateText } from 'ai';
import { NextResponse } from 'next/server';
import request from '@/request';
import { getServiceHeader } from '@/lib/x-service-auth';
import { getToken } from '@/lib/token';

export async function POST(req: NextRequest) {
	const {
		apiKey: key,
		model = 'gpt-4o-mini',
		prompt,
		system,
	} = await req.json();

	if (model === 'ollama') {
		return await request('/api/chat', {
			headers: getServiceHeader(getToken(req)),
			method: 'post',
			body: JSON.stringify({
				abortSignal: req.signal,
				maxTokens: 50,
				prompt: prompt,
				system,
				temperature: 0.7,
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

	try {
		const result = await generateText({
			abortSignal: req.signal,
			maxTokens: 50,
			model: openai(model),
			prompt: prompt,
			system,
			temperature: 0.7,
		});

		return NextResponse.json(result);
	} catch (error: any) {
		if (error.name === 'AbortError') {
			return NextResponse.json(null, { status: 408 });
		}

		return NextResponse.json(
			{ error: 'Failed to process AI request' },
			{ status: 500 },
		);
	}
}
