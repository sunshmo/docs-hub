import { NextResponse } from 'next/server';

import { ResponseWrapper } from 'docs-hub-shared-models';
import { extract } from '@/app/api/attachment/extract/extract';
import db from '@/lib/db';

export async function POST(req: Request) {
	try {
		const json = await req.json();
		const { ids } = json;

		if (!Array.isArray(ids)) {
			return NextResponse.json(ResponseWrapper.error('ids is required'));
		}

		const [rows] = await db.query(
			`SELECT
	a.id,a.filename,a.filepath,a.destName,a.userId,
	u.username username
FROM attachment a
LEFT JOIN user u ON a.userId = u.id
WHERE a.id IN (?)`,
			[ids],
		);

		let text = '';
		// @ts-expect-error
		for (const attachment of rows) {
			// 提取内容
			text += await extract(attachment);
			text += '\n';
		}

		return NextResponse.json(ResponseWrapper.success(text));
	} catch (err) {
		return NextResponse.json(ResponseWrapper.error(err.message, false));
	}
}
