import { NextRequest, NextResponse } from 'next/server';
import { ResponseWrapper } from 'docs-hub-shared-models';
import { withTransaction } from '@/lib/with-transaction';
import { randomUUID } from 'crypto';
import db from '@/lib/db';
import { decryptPassword, hashPassword } from '@/lib/bcrypt';

export async function POST(req: NextRequest) {
	try {
		const { username, password } = await req.json();

		if (typeof username !== 'string' || typeof password !== 'string') {
			return NextResponse.json(
				ResponseWrapper.error('username or password incorrect format'),
			);
		}

		if (!username?.trim()) {
			return NextResponse.json(ResponseWrapper.error('username is required'));
		}

		if (!password?.trim()) {
			return NextResponse.json(ResponseWrapper.error('password is required'));
		}

		const sql = `SELECT id,username FROM user WHERE username = ?`;
		const [rows] = await db.query(sql, [username.trim()]);
		const user = rows[0];
		if (user) {
			return NextResponse.json(
				ResponseWrapper.error('User has already exists'),
			);
		}

		// 使用私钥解密密码
		const decryptedPassword = decryptPassword(password);

		if (!decryptedPassword) {
			return NextResponse.json(
				ResponseWrapper.error('Failed to decrypt password'),
			);
		}

		// 对密码进行哈希处理
		const hashedPassword = hashPassword(decryptedPassword);

		const id = randomUUID();
		const result = await withTransaction(async (conn) => {
			const [userRes] = await conn.query(
				'INSERT INTO user (id, username, password) VALUES (?, ?, ?)',
				[id, username.trim(), hashedPassword],
			);

			return userRes;
		});

		// @ts-expect-error
		if (result?.affectedRows !== 1) {
			throw new Error('Registration failed');
		}

		return NextResponse.json(
			ResponseWrapper.success({ id, username: username.trim() }),
		);
	} catch (error) {
		console.error('Registration error:', error);
		return NextResponse.json(
			ResponseWrapper.error(error.message || 'Registration failed'),
		);
	}
}
