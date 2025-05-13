import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { ResponseWrapper } from 'docs-hub-shared-models';

// 查询
export async function POST(req: NextRequest) {
	try {
		const { ids, name, username, updateUsername } = await req.json();
		let sql = `SELECT
								 d.id,
								 d.name,
								 d.content,
								 d.type,
								 d.userId,
								 u1.username AS username,
								 d.updateUserId,
								 u2.username AS updateUsername,
								 DATE_FORMAT(d.createdAt, '%Y-%m-%d %H:%i:%s') AS createdAt,
								 DATE_FORMAT(d.updatedAt, '%Y-%m-%d %H:%i:%s') AS updatedAt
							 FROM
								 document d
									 LEFT JOIN user u1 ON d.userId = u1.id
									 LEFT JOIN user u2 ON d.updateUserId = u2.id
									 `;

		const params: string[] = [];
		const conditions: string[] = [];

		// 构建条件
		if (username?.trim()) {
			conditions.push(`u1.username LIKE CONCAT('%', ?, '%')`);
			params.push(username.trim());
		}

		if (updateUsername?.trim()) {
			conditions.push(`u2.username LIKE CONCAT('%', ?, '%')`);
			params.push(updateUsername.trim());
		}

		if (name?.trim()) {
			conditions.push(`d.name LIKE CONCAT('%', ?, '%')`);
			params.push(name.trim());
		}

		if (Array.isArray(ids) && ids.length) {
			// 根据数据库驱动处理数组参数
			// 方法1：使用多个问号 (适用于少量ID)
			// conditions.push(`d.id IN (${ids.map(() => '?').join(',')})`);
			// params.push(...ids);

			// 方法2：使用JSON函数 (更通用)
			conditions.push(`JSON_CONTAINS(?, CAST(d.id AS JSON))`);
			params.push(JSON.stringify(ids));
		}

		if (conditions.length) {
			sql += ` WHERE ${conditions.join(' AND ')} `;
		}

		// 时间倒序
		sql += 'ORDER BY d.updatedAt DESC';

		const [rows] = await db.query(sql, params);

		return NextResponse.json(ResponseWrapper.success(rows));
	} catch (err) {
		console.error('Error fetching users:', err);
		return NextResponse.json(ResponseWrapper.error(err.message, false));
	}
}
