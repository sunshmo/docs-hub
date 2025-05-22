import { NextRequest, NextResponse } from 'next/server';
import { signAccessToken, signRefreshToken, verifyToken } from '@/lib/jwt';
import { ResponseWrapper } from 'docs-hub-shared-models';
import {
	CsrfTokenOptions,
	RefreshTokenOptions,
	TokenOptions,
} from '@/lib/token';

export async function GET(req: NextRequest) {
	try {
		// http://localhost:3456/api/auth/test/redirect-fe?returnUri=http%3A%2F%2Flocalhost%3A3000&token=xxx
		const { searchParams } = new URL(req.url);
		const token = searchParams.get('token');
		const redirect = searchParams.get('returnUri') || '/';

		// 1. 参数验证
		if (!token) {
			// 可以重定向
			if (redirect) {
				if (!isValidRedirectUrl(redirect)) {
					return new NextResponse(
						JSON.stringify({ error: 'Invalid redirect URL' }),
						{ status: 400, headers: { 'Content-Type': 'application/json' } },
					);
				}
				return NextResponse.redirect(new URL(redirect));
			}
			return new NextResponse(
				JSON.stringify({ error: 'Missing token parameter' }),
				{ status: 400, headers: { 'Content-Type': 'application/json' } },
			);
		}

		// 验证 redirect URL 是否合法（防止开放重定向）
		if (redirect && !isValidRedirectUrl(redirect)) {
			return new NextResponse(
				JSON.stringify({ error: 'Invalid redirect URL' }),
				{ status: 400, headers: { 'Content-Type': 'application/json' } },
			);
		}

		// 2. 验证 JWT 并获取用户信息
		const user = await verifyToken(token);
		if (!user) {
			return NextResponse.json(ResponseWrapper.error('Invalid user data'), {
				status: 401,
			});
		}

		// 3. 生成令牌
		const accessToken = await signAccessToken(user);
		const refreshToken = await signRefreshToken(user);

		// 4. 设置 cookie 并重定向
		const response = NextResponse.redirect(new URL(redirect));

		response.cookies.set('token', accessToken, TokenOptions);
		response.cookies.set('refresh_token', refreshToken, RefreshTokenOptions);
		response.cookies.set('csrf_token', accessToken, CsrfTokenOptions);

		// 5. 添加安全头部
		response.headers.set('X-Content-Type-Options', 'nosniff');
		response.headers.set('X-Frame-Options', 'DENY');
		response.headers.set('X-XSS-Protection', '1; mode=block');

		return response;
	} catch (error) {
		console.error('SSO callback error:', error);
		return NextResponse.json(ResponseWrapper.error('SSO callback error'), {
			status: 500,
			headers: { 'Content-Type': 'application/json' },
		});
	}
}

// 辅助函数：验证重定向URL是否合法
function isValidRedirectUrl(url: string): boolean {
	try {
		const trustedDomains = getTrustedDomains();
		const parsedUrl = new URL(url);
		// 只允许重定向到自己的域名或可信域名
		const allowedDomains = [
			...new Set([process.env.API_BASE_URL].concat(trustedDomains)),
		].filter(Boolean);

		return allowedDomains.some(
			(domain) =>
				parsedUrl.hostname === domain ||
				parsedUrl.hostname.endsWith(`.${domain}`),
		);
	} catch {
		return false;
	}
}

function getTrustedDomains(): string[] {
	const domains = process.env.TRUSTED_REDIRECT_DOMAINS || '';
	return domains
		.split(',')
		.map((domain) => domain.trim())
		.filter((domain) => domain.length > 0);
}
