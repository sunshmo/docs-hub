import { NextRequest, NextResponse } from 'next/server';
import { getToken } from '@/lib/token';
import { verifyToken } from '@/lib/jwt';
import { generateAuthCode } from '@/lib/auth-code';
import { ResponseWrapper, TokenStatus } from 'docs-hub-shared-models';

export async function POST(req: NextRequest) {
	try {
		const accessToken = getToken(req);
		if (!accessToken) {
			return NextResponse.json(ResponseWrapper.error(TokenStatus.no_token));
		}

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

		const code: string = await generateAuthCode(user.id, accessToken);

		return NextResponse.json(ResponseWrapper.success(code));
	} catch (err) {
		return NextResponse.json(
			ResponseWrapper.error(err.message || 'get auth code failed'),
		);
	}
}
