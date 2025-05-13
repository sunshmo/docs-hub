import { NextRequest, NextResponse } from 'next/server';
import { withTransaction } from '@/lib/with-transaction';
import { ResponseWrapper } from 'docs-hub-shared-models';
import { randomUUID } from 'crypto';
import { getUserId } from '@/lib/get-user-id';

// create
export async function POST(req: NextRequest) {
	const { content, role, sessionId } = await req.json();

	if (!content) {
		return NextResponse.json(ResponseWrapper.error('content is required'));
	}

	if (!role) {
		return NextResponse.json(ResponseWrapper.error('role is required'));
	}

	if (!sessionId) {
		return NextResponse.json(ResponseWrapper.error('sessionId is required'));
	}

	try {
		const userId = await getUserId(req);
		const messageId = randomUUID();
		const result = await withTransaction(async (conn) => {
			const [res] = await conn.query(
				'INSERT INTO message (id, content, role, sessionId, userId) VALUES (?, ?, ?, ?, ?)',
				[messageId, content, role, sessionId, userId],
			);

			return res;
		});

		// @ts-expect-error
		if (result?.affectedRows === 1) {
			const message = {
				id: messageId,
				content,
				role,
				sessionId,
				userId,
			};

			return NextResponse.json(ResponseWrapper.success(message));
		}

		return NextResponse.json(ResponseWrapper.error('Create message failed'));
	} catch (err) {
		console.error('Error creating message:', err);
		return NextResponse.json(ResponseWrapper.error(err.message, false));
	}
}

// update
export async function PUT(req: NextRequest) {
	const { id, content } = await req.json();

	if (id == null) {
		return NextResponse.json(ResponseWrapper.error('id is required'));
	}

	if (content == null) {
		return NextResponse.json(ResponseWrapper.error('content is required'));
	}

	try {
		const result = await withTransaction(async (conn) => {
			const [userRes] = await conn.query(
				'UPDATE message SET content = ? WHERE id = ?',
				[content, id],
			);

			return userRes;
		});

		// @ts-expect-error
		if (result?.affectedRows === 1) {
			NextResponse.json(ResponseWrapper.success(true, 'Update successful'));
		}

		NextResponse.json(ResponseWrapper.error('Update failed'));
	} catch (err) {
		console.error('Error updating message:', err);
		return NextResponse.json(ResponseWrapper.error(err.message, false));
	}
}

// 删除 - 单个
export async function DELETE(req: NextRequest) {
	const { ids } = await req.json();

	if (!Array.isArray(ids)) {
		return NextResponse.json(ResponseWrapper.error('ids should be `string[]`'));
	}

	try {
		const result = await withTransaction(async (conn) => {
			const [deleteRes] = await conn.query(
				'UPDATE message SET deleted = 1 WHERE id IN (?)',
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
