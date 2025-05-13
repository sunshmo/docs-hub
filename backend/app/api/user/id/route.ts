import { NextRequest, NextResponse } from 'next/server';
import { ResponseWrapper } from 'docs-hub-shared-models';
import db from '@/lib/db';

export async function POST(req: NextRequest) {
	try {
		const { ids, username } = await req.json();

		// Validate input
		if (ids && !Array.isArray(ids)) {
			return NextResponse.json(
				ResponseWrapper.error('IDs must be provided as an array', false),
			);
		}

		// Base query components
		const selectFields = 'id, username, password';
		const fromClause = 'FROM user';
		const notDeletedCondition = 'WHERE deleted = 0';

		let query: string;
		let params: any[] = [];

		if (ids?.length > 0) {
			// For array of IDs
			query = `${selectFields} ${fromClause} ${notDeletedCondition} AND id IN (?)`;
			params = [ids];
		} else if (username) {
			// If you want to add username filtering (example)
			query = `${selectFields} ${fromClause} ${notDeletedCondition} AND username = ?`;
			params = [username];
		} else {
			// Get all non-deleted users
			query = `${selectFields} ${fromClause} ${notDeletedCondition}`;
		}

		// Execute query
		const [rows] = await db.query(query, params);

		return NextResponse.json(ResponseWrapper.success(rows));
	} catch (err) {
		console.error('Error in user API:', err);
		return NextResponse.json(
			ResponseWrapper.error('Internal server error', false),
		);
	}
}
