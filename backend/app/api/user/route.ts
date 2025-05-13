import { NextRequest, NextResponse } from 'next/server';
import { withTransaction } from '@/lib/with-transaction';
import { ResponseWrapper } from 'docs-hub-shared-models';

// 更新用户
export async function PUT(req: NextRequest) {
	try {
		const { id, username, password, email, telephone } = await req.json();

		if (!id) {
			return NextResponse.json(ResponseWrapper.error('id is required'));
		}

		const updates: string[] = [];
		const params: string[] = [];

		if (typeof username === 'string') {
			updates.push('username = ?');
			params.push(username.trim());
		}
		if (typeof password === 'string') {
			updates.push('password = ?');
			params.push(password.trim());
		}
		if (typeof email === 'string') {
			updates.push('email = ?');
			params.push(email.trim());
		}
		if (typeof telephone === 'string') {
			updates.push('telephone = ?');
			params.push(telephone.trim());
		}

		if (updates.length === 0) {
			return NextResponse.json(ResponseWrapper.error('No updateable fields provided'));
		}

		const sql = `UPDATE user SET ${updates.join(', ')} WHERE id = ?`;
		params.push(id); // id 是最后一个参数

		const result = await withTransaction(async (conn) => {
			const [userRes] = await conn.query(sql, params);
			return userRes;
		});

		// @ts-expect-error
		if (result?.affectedRows === 1) {
			return NextResponse.json(ResponseWrapper.success(true, 'Update successful'));
		}

		return NextResponse.json(ResponseWrapper.error('Update failed'));
	} catch (err) {
		console.error('Error updating user:', err);
		return NextResponse.json(ResponseWrapper.error(err.message));
	}
}

// 删除用户 - 单个
export async function DELETE(req: NextRequest) {
	const { ids } = await req.json();

	if (!Array.isArray(ids)) {
		return NextResponse.json(ResponseWrapper.error('ids should be `string[]`'));
	}

	try {
		const result = await withTransaction(async (conn) => {
			// const [deleteRes] = await conn.query('DELETE FROM user WHERE id = ?', [id]);
			const [deleteRes] = await conn.query(
				'UPDATE user SET deleted = 1 WHERE id IN (?)',
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
		console.error('Error deleting user:', err);
		return NextResponse.json(ResponseWrapper.error(err.message, false));
	}
}
