import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { ResponseWrapper } from 'docs-hub-shared-models';

// { label: 'ollama', value: 'ollama' },
//   { label: 'gpt-4o-mini', value: 'gpt-4o-mini' },
//   { label: 'gpt-4o', value: 'gpt-4o' },
// export interface Model {
//   label: string;
//   value: string;
// }
//
// export const models: Model[] = [
//   { label: 'ollama', value: 'ollama' },
//   { label: 'gpt-4o-mini', value: 'gpt-4o-mini' },
//   { label: 'gpt-4o', value: 'gpt-4o' },
//   { label: 'gpt-4-turbo', value: 'gpt-4-turbo' },
//   { label: 'gpt-4', value: 'gpt-4' },
//   { label: 'gpt-3.5-turbo', value: 'gpt-3.5-turbo' },
//   { label: 'gpt-3.5-turbo-instruct', value: 'gpt-3.5-turbo-instruct' },
// ];

export async function POST(req: NextRequest) {
	const { ids } = await req.json();
	if (!Array.isArray(ids)) {
		const [rows] = await db.query(`SELECT
	mp.id as id,
	mp.name as name,
	mp.apiKey as apiKey,
	mp.domain as domain
FROM model_provider as mp
ORDER BY updatedAt DESC;`);

		return NextResponse.json(ResponseWrapper.success(rows));
	}

	try {
		const [rows] = await db.query(
			`SELECT
    mp.id,
    mp.name,
    mp.apiKey,
    mp.domain
    FROM model_provider mp
		WHERE mp.id IN (?)`,
			[ids],
		);
		return NextResponse.json(ResponseWrapper.success(rows));
	} catch (err) {
		console.error('Error fetching model providers:', err);
		return NextResponse.json(ResponseWrapper.error(err.message, false));
	}
}
