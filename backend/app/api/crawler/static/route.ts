import * as cheerio from 'cheerio';
import { NextRequest, NextResponse } from 'next/server';
import { ResponseWrapper } from 'docs-hub-shared-models';
import request from '@/request';
import { getServiceAuth, getServiceHeader } from '@/lib/x-service-auth';
import { getToken } from '@/lib/token';

export async function POST(req: NextRequest) {
	const { url, tags } = await req.json();
	let generatedDoc = '';
	try {
		const rawContent = await fetchDocument(url, tags);
		generatedDoc = await generateDocumentation(rawContent, req);
		saveToMarkdown(generatedDoc);
	} catch (err) {
		return NextResponse.json(ResponseWrapper.error(err.message || 'Fetch failed'));
	}

	return NextResponse.json(ResponseWrapper.success(generatedDoc));
}

async function fetchDocument(url: string, tags?: string[]) {
	try {
		const response = await fetch(url);
		const data = await response.json();
		const $ = cheerio.load(data.data);

		let content = '';

		if (!Array.isArray(tags)) {
			$('html').each((i, el) => {
				content += $(el).text() + '\n';
			});
		} else {
			tags.forEach((tag) => {
				$(tag).each((i, el) => {
					content += $(el).text() + '\n';
				});
			});
		}

		return content;
	} catch (error) {
		console.error('Error fetching document:', error);
		throw error;
	}
}

async function generateDocumentation(content: string, req: NextRequest) {
	const prompt = `Transform the following into a clear, concise document：${content}`;

	const response = await request('/api/chat', {
		headers: getServiceHeader(getToken(req)),
		method: 'post',
		body: JSON.stringify({
			prompt: prompt,
			max_tokens: 1500,
			stream: false,
		}),
	});

	const { data } = await response.json();

	return data?.content;
}

function saveToMarkdown(content: string) {
	// fs.writeFileSync('documentation.md', content, 'utf8');
	console.log('Document saved as documentation.md');
}
