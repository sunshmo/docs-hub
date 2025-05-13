import { ResponseWrapper, TokenStatus } from 'docs-hub-shared-models';
import { NextRequest, NextResponse } from 'next/server';
import { signAccessToken, verifyToken } from '@/lib/jwt';
import {
	CsrfTokenOptions,
	getRefreshToken,
	getToken,
	RefreshTokenOptions,
	TokenOptions,
} from '@/lib/token';

export async function GET(req: NextRequest) {
	const token = getToken(req);
	const refreshToken = getRefreshToken(req);

	const accessPayload = token && (await verifyToken(token));
	if (accessPayload) {
		return NextResponse.json(ResponseWrapper.success(accessPayload));
	}

	// accessToken 过期，尝试用 refreshToken 刷新
	const refreshPayload = refreshToken && (await verifyToken(refreshToken));
	if (!refreshPayload) {
		return NextResponse.json(ResponseWrapper.error(TokenStatus.invalid_token), {
			status: 401,
			statusText: TokenStatus.invalid_token,
		});
	}

	try {
		const accessToken = await signAccessToken(refreshPayload);
		const response = NextResponse.json(ResponseWrapper.success(accessToken));

		const user = await verifyToken(accessToken);
		if (!user) {
			return NextResponse.json(
				ResponseWrapper.error(TokenStatus.invalid_token),
				{
					status: 401,
					statusText: TokenStatus.invalid_token,
				},
			);
		}

		response.cookies.set('token', accessToken, TokenOptions);
		response.cookies.set('refresh_token', refreshToken, RefreshTokenOptions);
		response.cookies.set('csrf_token', accessToken, CsrfTokenOptions);

		return response;
	} catch {
		return NextResponse.json(ResponseWrapper.error(TokenStatus.invalid_token), {
			status: 401,
			statusText: TokenStatus.invalid_token,
		});
	}
}
