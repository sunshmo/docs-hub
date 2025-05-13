import { NextRequest, NextResponse } from 'next/server';
import { ResponseWrapper } from 'docs-hub-shared-models';
import {
	CsrfTokenOptions,
	RefreshTokenOptions,
	TokenOptions,
} from '@/lib/token';

export async function GET(req: NextRequest) {
	const response = NextResponse.json(
		ResponseWrapper.success(true, 'Logged out'),
	);

	response.cookies.set(
		'token',
		'',
		Object.assign({}, TokenOptions, {
			expires: new Date(0), // 设置为过去时间
		}),
	);
	response.cookies.set(
		'refresh_token',
		'',
		Object.assign({}, RefreshTokenOptions, {
			expires: new Date(0), // 设置为过去时间
		}),
	);
	response.cookies.set('csrf_token', '', CsrfTokenOptions);

	return response;
}
