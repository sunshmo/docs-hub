import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { ResponseWrapper } from 'docs-hub-shared-models';

export async function POST(req: NextRequest) {
	const { ids } = await req.json();

	if (!Array.isArray(ids)) {
		const [rows] = await db.query('SELECT id,url,messageId FROM crawler');
		return NextResponse.json(ResponseWrapper.success(rows));
	}

	try {
		const [rows] = await db.query(
			'SELECT id,url,messageId FROM crawler WHERE id IN (?)',
			[ids],
		);
		return NextResponse.json(ResponseWrapper.success(rows));
	} catch (err) {
		console.error('Error fetching crawlers:', err);
		return NextResponse.json(ResponseWrapper.error(err.message, false));
	}
}
