import { NextRequest, NextResponse } from 'next/server';
import { ResponseWrapper } from 'docs-hub-shared-models';
import db from '@/lib/db';
import { signAccessToken, signRefreshToken, verifyToken } from '@/lib/jwt';
import { comparePassword, decryptPassword } from '@/lib/bcrypt';
import {
	CsrfTokenOptions,
	RefreshTokenOptions,
	TokenOptions,
} from '@/lib/token';

export async function POST(req: NextRequest) {
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

	// 1. 解密密码
	const decryptedPassword = decryptPassword(password.trim());

	if (!decryptedPassword) {
		return NextResponse.json(ResponseWrapper.error('Login failed'));
	}

	// 从数据库获取用户
	const sql = `SELECT * FROM user WHERE username = ?`;
	const [rows] = await db.query(sql, [username.trim()]);
	const user = rows[0];
	if (!user) {
		return NextResponse.json(ResponseWrapper.error('User not found'));
	}

	const isPasswordValid = comparePassword(decryptedPassword, user.password);
	if (!isPasswordValid) {
		return NextResponse.json(ResponseWrapper.error('User not found'));
	}

	// 签署token
	const ut = {
		id: user.id,
		username: user.username,
		email: user.email,
		telephone: user.telephone,
	};
	const accessToken = await signAccessToken(ut);
	const refreshToken = await signRefreshToken(ut);

	const response = NextResponse.json(
		ResponseWrapper.success(
			{
				accessToken, // 返回 token 给前端
				refreshToken,
				...(await verifyToken(accessToken)),
			},
			'Logged in',
		),
	);
	response.cookies.set('token', accessToken, TokenOptions);
	response.cookies.set('refresh_token', refreshToken, RefreshTokenOptions);
	response.cookies.set('csrf_token', accessToken, CsrfTokenOptions);

	// 登录成功（返回 token / 用户信息等）
	return response;
}
