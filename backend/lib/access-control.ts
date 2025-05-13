import { NextRequest, NextResponse } from 'next/server';

const allowedOrigins = ['http://localhost:3000', 'http://tauri.localhost'];

// 设置 CORS 头
const corsOptions = {
	'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,PATCH,OPTIONS',
	'Access-Control-Allow-Headers': 'Content-Type,Authorization,Accept,Accept-Version,Content-Length,Content-MD5,Content-Type,Date',
	'Access-Control-Allow-Credentials': 'true',
	Vary: 'Origin', // 确保缓存按 Origin 区分
};

export function getAllowedOrigin(req: NextRequest) {
	const origin = req.headers.get('origin') ?? '';
	return {
		valid: allowedOrigins.includes(origin),
		origin,
	};
}

export function accessControl(req: NextRequest, response: NextResponse) {
	const { valid, origin } = getAllowedOrigin(req);
	if (valid) {
		response.headers.set('Access-Control-Allow-Origin', origin);
	}

	Object.entries(corsOptions).forEach(([key, value]) => {
		response.headers.set(key, value);
	});
}

export function redirectToLogin(req: NextRequest) {
	const loginUrl = new URL('/api/test', 'http://localhost:3456');
	const response = NextResponse.redirect(loginUrl);

	// response.headers.set('Access-Control-Allow-Origin', loginUrl.origin);
	response.headers.set('Access-Control-Allow-Origin', req.nextUrl.origin);
	Object.entries(corsOptions).forEach(([key, value]) => {
		response.headers.set(key, value);
	});

	return response;
}
