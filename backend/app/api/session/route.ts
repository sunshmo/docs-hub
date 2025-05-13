import { NextRequest, NextResponse } from 'next/server';
import { withTransaction } from '@/lib/with-transaction';
import db from '@/lib/db';
import dayjs from 'dayjs';
import { randomUUID } from 'crypto';
import { RoleType, ResponseWrapper } from 'docs-hub-shared-models';
import { getUserId } from '@/lib/get-user-id';

// create
export async function POST(req: NextRequest) {
	const {
		sessionId,
		name,
		attachmentIds,
		prompt,
	} = await req.json();

	const content = prompt ? prompt.trim() : '';

	try {
		const userId = await getUserId(req);

		let id: string = '';
		await withTransaction(async (conn) => {
			if (!sessionId) {
				// todo: 提取内容核心生成
				const sn = name || dayjs().format('YYYY-MM-DD HH:mm:ss');
				id = randomUUID();
				await conn.query(
					'INSERT INTO session (id, name, userId) VALUES (?, ?, ?)',
					[id, sn, userId],
				);
			} else {
				id = sessionId;
			}

			// 创建message：此时，content就是prompt
			const messageId = randomUUID();
			await conn.query(
				'INSERT INTO message (id, content, role, sessionId, userId) VALUES (?, ?, ?, ?, ?)',
				[messageId, content, RoleType.user, id, userId],
			);

			if (Array.isArray(attachmentIds) && attachmentIds.length) {
				const mfRows = attachmentIds.map((attachmentId: string) => [
					randomUUID(),
					messageId,
					attachmentId,
				]);
				await conn.query(
					'INSERT INTO message_attachment (id, messageId, attachmentId) VALUES ?',
					[mfRows],
				);
			}

			return id;
		});

		if (!id) {
			throw new Error('Create session failed');
		}
		const [sessionRows] = await db.query(
			`SELECT s.id,s.name,s.userId,
       u.username usernmae,
       DATE_FORMAT(s.createdAt, '%Y-%m-%d %H:%i:%s') AS createdAt,
       DATE_FORMAT(s.updatedAt, '%Y-%m-%d %H:%i:%s') AS updatedAt
FROM session s
LEFT JOIN user u ON s.userId = u.id
WHERE s.id = ?`,
			[id],
		);

		// @ts-ignore
		if (!sessionRows?.length) {
			return NextResponse.json(ResponseWrapper.error('Create session failed'));
		}

		return NextResponse.json(ResponseWrapper.success(sessionRows[0]));
	} catch (err) {
		console.error('Error creating session:', err);
		return NextResponse.json(ResponseWrapper.error(err.message, false));
	}
}

// update
export async function PUT(req: NextRequest) {
	const { id, name } = await req.json();

	if (!id) {
		return NextResponse.json(ResponseWrapper.error('id is required'));
	}

	if (!name?.trim()) {
		return NextResponse.json(ResponseWrapper.error('name is required'));
	}

	try {
		const result = await withTransaction(async (conn) => {
			const [sessionRes] = await conn.query(
				'UPDATE session SET name = ? WHERE id = ?',
				[name.trim(), id],
			);

			// @ts-ignore
			return sessionRes.affectedRows === 1;
		});

		// @ts-expect-error
		if (result?.affectedRows === 1) {
			return NextResponse.json(ResponseWrapper.success(true, 'Update successful'));
		}

		return NextResponse.json(ResponseWrapper.error('Update failed'));
	} catch (err) {
		console.error('Error updating session:', err);
		return NextResponse.json(ResponseWrapper.error(err.message, false));
	}
}

export async function DELETE(req: NextRequest) {
	const { ids } = await req.json();

	if (!Array.isArray(ids)) {
		return NextResponse.json(ResponseWrapper.error('ids should be `string[]`'));
	}

	try {
		const result = await withTransaction(async (conn) => {
			const [deleteRes] = await conn.query(
				'UPDATE session SET deleted = 1 WHERE id IN (?)',
				[ids],
			);

			return deleteRes;
		});

		// @ts-expect-error
		if (result.affectedRows === ids.length) {
			return NextResponse.json(ResponseWrapper.success(true));
		}

		return NextResponse.json(ResponseWrapper.error('Delete failed'));
	} catch (err) {
		console.error('Error deleting message:', err);
		return NextResponse.json(ResponseWrapper.error(err.message, false));
	}
}
