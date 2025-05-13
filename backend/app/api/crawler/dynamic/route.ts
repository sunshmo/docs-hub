import { NextResponse } from 'next/server';

// import { crawlToMarkdown } from '@/app/api/crawler/dynamic/page2markdown';
import { ResponseWrapper } from 'docs-hub-shared-models';
import { getVisibleText } from '@/app/api/crawler/dynamic/get-visible-text';

export async function POST(req: Request) {
	try {
		const json = await req.json();
		const { url } = json;

		if (!url) {
			return NextResponse.json(ResponseWrapper.success(''));
		}

		return NextResponse.json(
			ResponseWrapper.success(await getVisibleText(url)),
		);
		// return NextResponse.json(ResponseWrapper.success(await crawlToMarkdown({ url })));
	} catch (error) {
		console.error('crawl failed:', error);

		return NextResponse.json(ResponseWrapper.error('crawl failed'));
	}
}
