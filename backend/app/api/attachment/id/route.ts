import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { ResponseWrapper } from 'docs-hub-shared-models';

export async function POST(req: NextRequest) {
	const { ids } = await req.json();
	if (!Array.isArray(ids)) {
		const [rows] = await db.query(`SELECT
    a.id,a.filename,a.filepath,a.destName,a.userId,
    u.username username
FROM attachment a
LEFT JOIN user u ON a.userId = a.id`);

		return NextResponse.json(ResponseWrapper.success(rows));
	}

	try {
		const [rows] = await db.query(
			`SELECT
																		 a.id,a.filename,a.filepath,a.destName,a.userId,
																		 u.username username
																	 FROM attachment a
																					LEFT JOIN user u ON a.userId = a.id
																	 WHERE id IN (?)`,
			[ids],
		);

		return NextResponse.json(ResponseWrapper.success(rows));
	} catch (err) {
		console.error('Error fetching files:', err);
		return NextResponse.json(ResponseWrapper.error(err.message, false));
	}
}
