import { NextResponse } from 'next/server';

import { ResponseWrapper } from 'docs-hub-shared-models';
import { extract } from '@/app/api/attachment/extract/extract';
import db from '@/lib/db';

export async function POST(req: Request) {
	let result: string;
	try {
		const json = await req.json();
		const { id } = json;

		if (id == null) {
			return NextResponse.json(ResponseWrapper.error('id is required'));
		}

		try {
			const [rows] = await db.query(
				`SELECT
    a.id,a.filename,a.filepath,a.destName,a.userId,
    u.username username
FROM attachment a
LEFT JOIN user u ON a.userId = a.id
WHERE id = ?`,
				[id],
			);

			const attachment = rows[0];

			if (!attachment) {
				return NextResponse.json(ResponseWrapper.error('File does not exist'));
			}

			// 提取内容
			result = await extract(attachment);

			return NextResponse.json(ResponseWrapper.success(result));
		} catch (err) {
			console.error('Error deleting crawler:', err);
			return NextResponse.json(ResponseWrapper.error(err.message, false));
		}
	} catch (err) {
		return NextResponse.json(ResponseWrapper.error(err.message, false));
	}
}
