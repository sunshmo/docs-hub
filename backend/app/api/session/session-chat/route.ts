import { NextRequest, NextResponse } from 'next/server';
import { Attachment, RoleType, ResponseWrapper } from 'docs-hub-shared-models';
import request from '@/request';
import { splitSentencesWithOverlap } from '@/app/text-helper/split';
import { callOllamaDefault, callOllamaStream } from '@/request/ollama';
import db from '@/lib/db';
import { extract } from '@/app/api/attachment/extract/extract';
import { getServiceHeader } from '@/lib/x-service-auth';
import { getToken } from '@/lib/token';

const sql = `SELECT
    m.role,
    m.content,
    a.id as attachmentId,
    a.filepath,
    a.destName
FROM
    message m
        LEFT JOIN
    message_attachment ma ON m.id = ma.messageId
        LEFT JOIN
    attachment a ON ma.attachmentId = a.id
WHERE
    m.sessionId = ?
ORDER BY
    m.createdAt;`;

interface MessageContentInfo {
	role: RoleType;
	content: string;
	destName: string;
	filepath: string;
	attachmentId: string;
}

export async function POST(req: NextRequest) {
	try {
		const { sessionId, stream = true } = await req.json();

		if (!sessionId) {
			return NextResponse.json(ResponseWrapper.error('sessionId is required'));
		}

		// 根据sessionId查询之前的已有message，保持上下文联系
		const [rows] = await db.query(sql, [sessionId]);
		const nextRows = rows as MessageContentInfo[];
		for (let i = 0; i < nextRows.length; i++) {
			const { attachmentId, filepath, destName, content } = nextRows[i];
			let str = content?.trim();
			// read file content
			if (attachmentId) {
				const fileContent = await extract({ destName, filepath } as Attachment);
				if (fileContent) {
					str = `${fileContent}\n${nextRows[i].content}`;
				}
			}

			let texts: string[] = [];
			try {
				texts = splitSentencesWithOverlap(str);
			} catch (err) {
				console.error('split file content failed', err);
			}

			nextRows[i].content = texts.join('\n');
		}

		const messages = nextRows.map((e: MessageContentInfo) => {
			return {
				role: e.role,
				content: e.content,
			};
		});

		if (stream) {
			// 流式调用 gpt
			try {
				const stream = await callOllamaStream(
					{
						messages,
					},
					req.signal,
					(streamString: string) => {
						saveMessage(streamString, sessionId, req);
					},
				);
				if (stream == null) {
					return NextResponse.json(ResponseWrapper.error('Failed to call model'));
				}
				return new NextResponse(stream);
			} catch (err) {
				return NextResponse.json(ResponseWrapper.error(err.message, false));
			}
		}

		// json方式返回
		const data = await callOllamaDefault({ sessionId, messages });
		return NextResponse.json(data);
	} catch (err) {
		console.log(err);
		return NextResponse.json(ResponseWrapper.error(err.message, false));
	}
}

function saveMessage(content: string, sessionId: string, req: NextRequest) {
	if (!sessionId) {
		console.warn('message does not save');
		return;
	}
	request('/api/message', {
		headers: getServiceHeader(getToken(req)),
		method: 'post',
		body: JSON.stringify({
			content,
			role: RoleType.assistant,
			sessionId,
		}),
	}).catch((err) => {
		console.error('Save assistant message failed', err);
	});
}
