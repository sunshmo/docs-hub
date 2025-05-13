import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/jwt';
import { TokenStatus, ResponseWrapper } from 'docs-hub-shared-models';
import { getToken } from '@/lib/token';
import { getCsrfTokenFromRequest, shouldCheckCsrf } from '@/lib/csrf';
import { accessControl } from '@/lib/access-control';
import { logSecurityEvent } from '@/lib/log';

export async function middleware(req: NextRequest) {
	const { method } = req;
	const { pathname } = req.nextUrl;

	// 1. 处理预检请求 (OPTIONS) - 最优先处理
	if (method === 'OPTIONS') {
		const response = new NextResponse(null, { status: 204 });
		accessControl(req, response);
		return response;
	}

	// 2. 设置响应对象，后续可以复用
	const response = NextResponse.next();
	accessControl(req, response);

	// 3. 跳过不需要认证和CSRF检查的路径
	const isPublicAPI = pathname.startsWith('/api/auth/') ||
		pathname.startsWith('/api/public/');

	if (isPublicAPI) {
		return response;
	}

	let userInfo;
	// 4. 验证受保护API的JWT令牌
	const isSecureAPI = pathname.startsWith('/api/');
	const isServiceCall = req.headers.get('X-Service-Auth') === process.env.SERVICE_SECRET;

	if (!isServiceCall) {
		if (isSecureAPI) {
			const token = getToken(req);

			// JWT验证失败处理
			if (!token) {
				return NextResponse.json(
					ResponseWrapper.error(TokenStatus.invalid_token), {
						status: 401,
						statusText: TokenStatus.invalid_token,
					}
				);
			}

			userInfo = await verifyToken(token);
			if (!userInfo) {
				return NextResponse.json(
					ResponseWrapper.error(TokenStatus.invalid_token), {
						status: 401,
						statusText: TokenStatus.invalid_token,
					}
				);
			}
		}

		// 5. CSRF验证（仅对需要保护的HTTP方法和路径）
		if (shouldCheckCsrf(pathname, method)) {
			const csrfToken = getCsrfTokenFromRequest(req);

			if (!csrfToken) {
				logSecurityEvent({
					event: 'CSRF_VALIDATION_FAILED',
					message: `CSRF check failed for ${method} ${pathname}`,
					metadata: {
						// @ts-expect-error
						ip: req.ip ?? 'unknown',
						userAgent: req.headers.get('user-agent') ?? 'unknown',
						path: pathname,
						method
					}
				});

				return NextResponse.json(
					ResponseWrapper.error('Invalid CSRF token'),
					{ status: 403, statusText: TokenStatus.invalid_token }
				);
			}
		}
	}

	return response;
}

export const config = {
	matcher: [
		'/api/:path*',
		/*
		 * Match all request paths except for the ones starting with:
		 * - api (API routes)
		 * - _next/static (static files)
		 * - _next/image (image optimization files)
		 * - favicon.ico, sitemap.xml, robots.txt (metadata files)
		 */
		// {
		// 	source:
		// 		'/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)',
		// 	missing: [
		// 		{ type: 'header', key: 'next-router-prefetch' },
		// 		{ type: 'header', key: 'purpose', value: 'prefetch' },
		// 	],
		// },
		//
		// {
		// 	source:
		// 		'/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)',
		// 	has: [
		// 		{ type: 'header', key: 'next-router-prefetch' },
		// 		{ type: 'header', key: 'purpose', value: 'prefetch' },
		// 	],
		// },
		//
		// {
		// 	source:
		// 		'/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)',
		// 	has: [{ type: 'header', key: 'x-present' }],
		// 	missing: [{ type: 'header', key: 'x-missing', value: 'prefetch' }],
		// },
	],
};
