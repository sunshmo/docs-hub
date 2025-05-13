import { NextRequest, NextResponse } from 'next/server';
import { ResponseWrapper } from 'docs-hub-shared-models';
import { callOllamaDefault, callOllamaStream } from '@/request/ollama';

export async function POST(req: NextRequest) {
	try {
		const { model, messages, prompt, stream = true } = await req.json();

		if (stream) {
			// 流式调用 gpt
			const response = await callOllamaStream(
				{ model, messages, prompt, stream },
				req.signal,
			);
			if (response == null) {
				return NextResponse.json(ResponseWrapper.error('Ollama request failed'), {
					status: 500,
				});
			}
			// 流
			return new NextResponse(response);
		}

		// json方式返回
		const jsonRes = await callOllamaDefault({
			model,
			messages,
			prompt,
			stream,
		});
		if (jsonRes == null) {
			return NextResponse.json(ResponseWrapper.error('Ollama request failed'), {
				status: 500,
			});
		}
		return NextResponse.json(ResponseWrapper.success(jsonRes));
	} catch (err) {
		console.log(err);
		return NextResponse.json(ResponseWrapper.error(err.message, false));
	}
}
