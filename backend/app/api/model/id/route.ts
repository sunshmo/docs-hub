import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { ResponseWrapper } from 'docs-hub-shared-models';

export async function POST(req: NextRequest) {
	try {
		const { modelIds, providerId } = await req.json();

		if (!Array.isArray(modelIds)) {
			if (!providerId) {
				const allSql = `SELECT
    				m.id,
    				m.name,
						CONCAT(m.name, '/', mp.name) fullname,
						m.config,
						m.providerId providerId,
						mp.name providerName
					FROM model m
					LEFT JOIN model_provider mp ON m.providerId = mp.id`;

				const [rows] = await db.query(allSql);
				return NextResponse.json(ResponseWrapper.success(rows));
			} else {
				const sql = `SELECT
						m.id, m.name, m.config, m.providerId providerId,
						mp.name providerName
					FROM model m
					LEFT JOIN model_provider mp ON m.providerId = mp.id
					WHERE m.providerId = ?`;

				const [rows] = await db.query(sql, [providerId]);
				return NextResponse.json(ResponseWrapper.success(rows));
			}
		}

		// Handle array case
		if (modelIds.length === 0) {
			return NextResponse.json(ResponseWrapper.success([]));
		}

		if (!providerId) {
			const allSql = `SELECT m.id, m.name, m.config, m.providerId providerId,
					mp.name providerName
				FROM model m LEFT JOIN model_provider mp ON m.providerId = mp.id
				WHERE m.id IN (?)`;
			const [rows] = await db.query(allSql, [modelIds]);
			return NextResponse.json(ResponseWrapper.success(rows));
		} else {
			const sql = `SELECT m.id, m.name, m.config, m.providerId providerId,
					mp.name providerName
				FROM model m
				WHERE m.id IN (?) AND m.providerId = ?`;
			const [rows] = await db.query(sql, [modelIds, providerId]);
			return NextResponse.json(ResponseWrapper.success(rows));
		}
	} catch (error) {
		console.error('Model query error:', error);
		return NextResponse.json(ResponseWrapper.error('Model query error'), {
			status: 500,
		});
	}
}
