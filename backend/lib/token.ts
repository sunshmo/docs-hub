import { NextRequest } from 'next/server';
import { ResponseCookie } from 'next/dist/compiled/@edge-runtime/cookies';
import { TokenStatus } from 'docs-hub-shared-models';

export function getToken(req: NextRequest) {
	const token = (
		req.cookies.get('token')?.value ||
		req.headers.get('authorization')?.replace('Bearer ', '')
	);

	if (!token) {
		throw new Error(TokenStatus.invalid_token)
	}

	return token;
}

export function getRefreshToken(req: NextRequest) {
	return req.cookies.get('refresh_token')?.value;
}

export const TokenOptions: Partial<ResponseCookie> | ResponseCookie = {
	httpOnly: true,
	secure: process.env.NODE_ENV === 'production', // 开发环境不需要 secure
	sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
	path: '/',
	maxAge: 60 * 15, // 15分钟
};

export const RefreshTokenOptions: Partial<ResponseCookie> | ResponseCookie = {
	httpOnly: true,
	secure: process.env.NODE_ENV === 'production',
	sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
	path: '/',
	maxAge: 60 * 60 * 24, // 1天
};

export const CsrfTokenOptions: Partial<ResponseCookie> | ResponseCookie = {
	httpOnly: false, // 需要能被JavaScript读取
	secure: process.env.NODE_ENV === 'production',
	sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
	path: '/',
	maxAge: 60 * 60 * 24, // 1天
};
