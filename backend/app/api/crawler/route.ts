import { NextRequest, NextResponse } from 'next/server';
import { withTransaction } from '@/lib/with-transaction';
import { ResponseWrapper } from 'docs-hub-shared-models';

// create
export async function POST(req: NextRequest) {
	const { url, messageId } = await req.json();

	if (!url) {
		return NextResponse.json(ResponseWrapper.error('url is required'));
	}

	if (!messageId) {
		return NextResponse.json(ResponseWrapper.error('messageId is required'));
	}

	try {
		const result = await withTransaction(async (conn) => {
			const [crawlerRes] = await conn.query(
				'INSERT INTO crawler (url, messageId) VALUES (?, ?)',
				[url, messageId],
			);

			return crawlerRes;
		});

		return NextResponse.json(ResponseWrapper.success(result));
	} catch (err) {
		console.error('Error creating crawler:', err);
		return NextResponse.json(ResponseWrapper.error(err.message, false));
	}
}

// update
export async function PUT(req: NextRequest) {
	const { id, url, messageId } = await req.json();

	if (id == null) {
		return NextResponse.json(ResponseWrapper.error('id is required'));
	}

	let sql = 'UPDATE crawler SET ';
	let list = [id];
	if (url) {
		list.unshift(url);
		sql += 'content = ? ';
	}
	if (messageId) {
		list.unshift(messageId);
		sql += 'messageId = ? ';
	}

	try {
		const result = await withTransaction(async (conn) => {
			const [userRes] = await conn.query(sql, list);

			return userRes;
		});

		// @ts-expect-error
		if (result?.affectedRows === 1) {
			NextResponse.json(ResponseWrapper.success(true, 'Update successful'));
		}

		NextResponse.json(ResponseWrapper.error('Update failed'));
	} catch (err) {
		console.error('Error updating crawler:', err);
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
			// const [deleteRes] = await conn.query('DELETE FROM crawler WHERE id = ?', [id]);
			const [deleteRes] = await conn.query(
				'UPDATE crawler SET deleted = 1 WHERE id IN (?)',
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
		console.error('Error deleting crawler:', err);
		return NextResponse.json(ResponseWrapper.error(err.message, false));
	}
}
