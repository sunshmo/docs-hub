import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { ResponseWrapper } from 'docs-hub-shared-models';

export async function POST(req: NextRequest) {
	let sql = `SELECT
    m.id AS id,
    m.content AS content,
    m.role AS role,
		(
			SELECT JSON_ARRAYAGG(
				JSON_OBJECT('id', a.id, 'filepath', a.filepath, 'destName', a.destName, 'filename', a.filename)
		 	)
			FROM attachment a
			WHERE a.id IN (
				SELECT ma.attachmentId
				FROM message_attachment ma
				WHERE ma.messageId = m.id
			)
		) AS files,
    m.sessionId AS sessionId,
    s.name AS sessionName,
    m.userId AS userId,
    u.username as username,
    DATE_FORMAT(m.createdAt, '%Y-%m-%d %H:%i:%s') AS createdAt,
		DATE_FORMAT(m.updatedAt, '%Y-%m-%d %H:%i:%s') AS updatedAt
FROM message m
LEFT JOIN session s ON m.sessionId = s.id
LEFT JOIN user u ON m.userId = u.id `;

	const { ids } = await req.json();

	if (!Array.isArray(ids)) {
		const [rows] = await db.query(sql);
		return NextResponse.json(ResponseWrapper.success(rows));
	}

	try {
		const [rows] = await db.query(`${sql} WHERE id IN (?)`, [ids]);
		return NextResponse.json(ResponseWrapper.success(rows));
	} catch (err) {
		console.error('Error fetching messages:', err);
		return NextResponse.json(ResponseWrapper.error(err.message, false));
	}
}
