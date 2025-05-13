import { NextRequest, NextResponse } from 'next/server';
import { withTransaction } from '@/lib/with-transaction';
import db from '@/lib/db';
import { randomUUID } from 'crypto';
import { ModelProvider, ResponseWrapper } from 'docs-hub-shared-models';

// create
export async function POST(req: NextRequest) {
	const { name, apiKey, domain } = await req.json();

	if (typeof name !== 'string') {
		return NextResponse.json(ResponseWrapper.error('name is invalid type'));
	}

	if (apiKey && typeof apiKey !== 'string') {
		return NextResponse.json(ResponseWrapper.error('apiKey is invalid type'));
	}

	if (domain && typeof domain !== 'string') {
		return NextResponse.json(ResponseWrapper.error('domain is invalid type'));
	}

	if (!name.trim()) {
		return NextResponse.json(ResponseWrapper.error('name is requred'));
	}

	const [exists] = await db.query(
		'SELECT * FROM model_provider WHERE name = ?',
		[name.trim()],
	);
	// @ts-expect-error
	if (exists?.length) {
		return NextResponse.json(ResponseWrapper.error(`${name} has already exists`));
	}
	try {
		const id = randomUUID();
		const data: ModelProvider = {
			id,
			name: name.trim(),
			apiKey: apiKey ? apiKey.trim() : '',
			domain: domain ? domain.trim() : '',
		};
		const result = await withTransaction(async (conn) => {
			const [modelRes] = await conn.query(
				'INSERT INTO model_provider (id, name, apiKey, domain) VALUES (?, ?, ?, ?)',
				[id, data.name, data.apiKey, data.domain],
			);

			return modelRes;
		});

		// @ts-expect-error
		if (result.affectedRows === 1) {
			return NextResponse.json(ResponseWrapper.success(data));
		}
		return NextResponse.json(ResponseWrapper.error('Create failed'));
	} catch (err) {
		console.error('Error creating model provider:', err);
		return NextResponse.json(ResponseWrapper.error(err.message, false));
	}
}

// update
export async function PUT(req: NextRequest) {
	interface UpdateRequest {
		id: string;
		name?: string;
		apiKey?: string;
		domain?: string;
	}

	const { id, name, apiKey, domain } = (await req.json()) as UpdateRequest;
	const list: string[] = [];
	const sets: string[] = [];

	if (!id) {
		return NextResponse.json(ResponseWrapper.error('id is required'));
	}

	// 验证 name
	if (name !== undefined) {
		if (typeof name !== 'string' || !name.trim()) {
			return NextResponse.json(ResponseWrapper.error('name is required'));
		}
		sets.push('name = ?');
		list.push(name.trim());
	}

	// 验证 apiKey
	if (apiKey !== undefined) {
		if (typeof apiKey !== 'string' || !apiKey.trim()) {
			return NextResponse.json(
				ResponseWrapper.error('apiKey is required'),
			);
		}
		sets.push('apiKey = ?');
		list.push(apiKey.trim());
	}

	// 验证 domain
	if (domain !== undefined) {
		if (typeof domain !== 'string' || !domain.trim()) {
			return NextResponse.json(
				ResponseWrapper.error('domain is required'),
			);
		}
		try {
			new URL(domain.startsWith('http') ? domain : `https://${domain}`);
		} catch {
			return NextResponse.json(ResponseWrapper.error('domain should be valid URL'));
		}
		sets.push('domain = ?');
		list.push(domain.trim());
	}

	if (sets.length === 0) {
		return NextResponse.json(ResponseWrapper.error('No updateable fields provided'));
	}

	list.push(id);

	try {
		const result = await withTransaction(async (conn) => {
			const sql = `UPDATE model_provider SET ${sets.join(', ')} WHERE id = ?`;
			const [modelRes] = await conn.query(sql, list);
			return modelRes;
		});

		// @ts-expect-error
		if (result?.affectedRows === 1) {
			return NextResponse.json(ResponseWrapper.success(true));
		}

		return NextResponse.json(ResponseWrapper.error('Update failed'));
	} catch (err) {
		console.error('Error updating model provider:', err);
		return NextResponse.json(ResponseWrapper.error('Update failed'));
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
				'DELETE FROM model_provider WHERE id IN (?)',
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
		console.error('Error deleting model provider:', err);
		return NextResponse.json(ResponseWrapper.error(err.message, false));
	}
}
