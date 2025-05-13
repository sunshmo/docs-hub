import { NextRequest, NextResponse } from 'next/server';
import { withTransaction } from '@/lib/with-transaction';
import { ResponseWrapper } from 'docs-hub-shared-models';
import { randomUUID } from 'crypto';
import { getUserId } from '@/lib/get-user-id';

// 创建
export async function POST(req: NextRequest) {
	const { name, content } = await req.json();

	if (!name) {
		return NextResponse.json(ResponseWrapper.error('name is required'));
	}

	if (!content) {
		return NextResponse.json(ResponseWrapper.error('content is required'));
	}

	try {
		const userId = await getUserId(req);
		const id = randomUUID();
		const result = await withTransaction(async (conn) => {
			const [documentRes] = await conn.query(
				'INSERT INTO document (id, name, content, userId) VALUES (?, ?, ?, ?)',
				[id, name, content, userId],
			);

			return documentRes;
		});

		// @ts-expect-error
		if (result.affectedRows === 1) {
			return NextResponse.json(ResponseWrapper.success(true));
		}
		return NextResponse.json(ResponseWrapper.error('document generate failed'));
	} catch (err) {
		console.error('Error creating document:', err);
		return NextResponse.json(ResponseWrapper.error(err.message, false));
	}
}

// 更新
export async function PUT(req: NextRequest) {
	const { id, name, content } = await req.json();

	if (!id) {
		return NextResponse.json(ResponseWrapper.error('id is required'));
	}

	const params: string[] = [];
	const sets: string[] = [];

	if (typeof name === 'string' && name.trim()) {
		params.push(name.trim());
		sets.push('name = ? ');
	}
	if (typeof content === 'string' && content.trim()) {
		params.push(content.trim());
		if (sets.length) {
			sets.push(', content = ? ');
		} else {
			sets.push('content = ? ');
		}
	}
	sets.push('WHERE id = ?');
	params.push(id);

	const list = ['UPDATE document SET '].concat(sets);

	try {
		const result = await withTransaction(async (conn) => {
			const [documentRes] = await conn.query(list.join(''), params);

			return documentRes;
		});

		// @ts-expect-error
		if (result?.affectedRows === 1) {
			return NextResponse.json(ResponseWrapper.success(true, 'Update successful'));
		}

		return NextResponse.json(ResponseWrapper.error('Update failed'));
	} catch (err) {
		console.error('Error updating document:', err);
		return NextResponse.json(ResponseWrapper.error(err.message, false));
	}
}

// 删除
export async function DELETE(req: NextRequest) {
	const { ids } = await req.json();

	if (!Array.isArray(ids)) {
		return NextResponse.json(ResponseWrapper.error('ids should be `string[]`'));
	}

	try {
		const result = await withTransaction(async (conn) => {
			const [deleteRes] = await conn.query(
				'UPDATE document SET deleted = 1 WHERE id IN (?)',
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
		console.error('Error deleting document:', err);
		return NextResponse.json(ResponseWrapper.error(err.message, false));
	}
}
