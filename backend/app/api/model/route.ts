import { NextRequest, NextResponse } from 'next/server';
import { withTransaction } from '@/lib/with-transaction';
import { ResponseWrapper } from 'docs-hub-shared-models';
import { randomUUID } from 'crypto';

// create
export async function POST(req: NextRequest) {
	const { name, config, providerId } = await req.json();

	if (typeof name !== 'string') {
		return NextResponse.json(ResponseWrapper.error('name is invalid type'));
	}

	if (!providerId) {
		return NextResponse.json(ResponseWrapper.error('providerId is required'));
	}

	if (config && typeof config !== 'string') {
		return NextResponse.json(ResponseWrapper.error('config is invalid type'));
	}

	if (!name.trim()) {
		return NextResponse.json(ResponseWrapper.error('name is required'));
	}

	try {
		const id = randomUUID();
		const result = await withTransaction(async (conn) => {
			const [modelRes] = await conn.query(
				'INSERT INTO model (id, name, config, providerId) VALUES (?, ?, ?, ?)',
				[id, name.trim(), config, providerId],
			);

			return modelRes;
		});

		// @ts-expect-error
		if (result.affectedRows === 1) {
			return NextResponse.json(
				ResponseWrapper.success({
					id,
					name: name.trim(),
					config,
					providerId,
				}),
			);
		}
		return NextResponse.json(ResponseWrapper.error('Create failed'));
	} catch (err) {
		console.error('Error creating model:', err);
		return NextResponse.json(ResponseWrapper.error(err.message, false));
	}
}

// update
export async function PUT(req: NextRequest) {
	const { name, config, id, providerId } = await req.json();

	if (!providerId) {
		return NextResponse.json(ResponseWrapper.error('providerId is required'));
	}
	const sets: string[] = [];
	const list: string[] = [];

	if (name) {
		if (typeof name !== 'string') {
			return NextResponse.json(ResponseWrapper.error('name is invalid type'));
		}

		if (!name.trim()) {
			return NextResponse.json(ResponseWrapper.error('name is required'));
		}

		sets.push('name = ?');
		list.push(name.trim());
	}

	if (config) {
		if (typeof config !== 'string') {
			return NextResponse.json(ResponseWrapper.error('config is invalid type'));
		}

		sets.push('config = ?');
		list.push(config.trim());
	}

	list.push(id, providerId);

	try {
		const result = await withTransaction(async (conn) => {
			const sql = `UPDATE model SET ${sets.join(', ')} WHERE id = ? AND providerId = ?`;
			const [modelRes] = await conn.query(sql, list);

			return modelRes;
		});

		// @ts-expect-error
		if (result?.affectedRows === 1) {
			return NextResponse.json(ResponseWrapper.success(true));
		}

		return NextResponse.json(ResponseWrapper.error('Update failed'));
	} catch (err) {
		console.error('Error updating model:', err);
		return NextResponse.json(ResponseWrapper.error(err.message, false));
	}
}

export async function DELETE(req: NextRequest) {
	const { ids, providerId } = await req.json();

	if (!providerId) {
		return NextResponse.json(ResponseWrapper.error('providerId is required'));
	}

	if (!Array.isArray(ids)) {
		return NextResponse.json(ResponseWrapper.error('ids should be `string[]`'));
	}

	try {
		const result = await withTransaction(async (conn) => {
			const [deleteRes] = await conn.query(
				'DELETE FROM model WHERE id IN (?) AND providerId = ?',
				[ids, providerId],
			);

			return deleteRes;
		});

		// @ts-expect-error
		if (result.affectedRows === ids.length) {
			return NextResponse.json(ResponseWrapper.success(true));
		}

		return NextResponse.json(ResponseWrapper.error('Delete failed'));
	} catch (err) {
		console.error('Error deleting model:', err);
		return NextResponse.json(ResponseWrapper.error(err.message, false));
	}
}
