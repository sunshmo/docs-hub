import { ResponseWrapper, TokenStatus } from 'docs-hub-shared-models';
import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/jwt';
import { getToken } from '@/lib/token';

export async function GET(req: NextRequest) {
	const token = getToken(req);
	const user = token && (await verifyToken(token));

	if (!user) {
		return NextResponse.json(ResponseWrapper.error(TokenStatus.invalid_token), {
			status: 401,
			statusText: TokenStatus.invalid_token,
		});
	}

	return NextResponse.json(ResponseWrapper.success(user));
}
