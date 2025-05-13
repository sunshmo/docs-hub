import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { ResponseWrapper } from 'docs-hub-shared-models';

export async function POST(req: NextRequest) {
	const { ids } = await req.json();

	if (!Array.isArray(ids)) {
		const sql = `SELECT s.id,s.name,s.userId,
       u.username usernmae,
       DATE_FORMAT(s.createdAt, '%Y-%m-%d %H:%i:%s') AS createdAt,
       DATE_FORMAT(s.updatedAt, '%Y-%m-%d %H:%i:%s') AS updatedAt
FROM session s
LEFT JOIN user u ON s.userId = u.id
WHERE s.deleted = 0 ORDER BY updatedAt DESC`;

		const [rows] = await db.query(sql);
		return NextResponse.json(ResponseWrapper.success(rows));
	}

	try {
		const [rows] = await db.query(
			`SELECT s.id,s.name,s.userId,
       u.username usernmae,
       DATE_FORMAT(s.createdAt, '%Y-%m-%d %H:%i:%s') AS createdAt,
       DATE_FORMAT(s.updatedAt, '%Y-%m-%d %H:%i:%s') AS updatedAt
FROM session s
LEFT JOIN user u ON s.userId = u.id
WHERE s.deleted = 0 AND s.id IN (?) ORDER BY updatedAt DESC`,
			[ids],
		);

		return NextResponse.json(ResponseWrapper.success(rows));
	} catch (err) {
		console.error('Error fetching sessions:', err);
		return NextResponse.json(ResponseWrapper.error(err.message, false));
	}
}
