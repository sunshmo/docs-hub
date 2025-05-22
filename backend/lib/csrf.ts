import { NextRequest } from 'next/server';

export async function generateCsrfToken(userId?: string): Promise<string> {
	const encoder = new TextEncoder();
	const timestamp = Date.now().toString();

	// 确保与验证时相同的格式
	const data = `${timestamp}|${userId || ''}|${process.env.CSRF_SECRET}`;

	const hashBuffer = await crypto.subtle.digest(
		'SHA-256',
		encoder.encode(data),
	);
	const hashArray = Array.from(new Uint8Array(hashBuffer));
	const hashHex = hashArray
		.map((b) => b.toString(16).padStart(2, '0'))
		.join('');

	return `${timestamp}.${hashHex}`;
}

export async function verifyCsrfToken(
	token: string,
	userId?: string,
): Promise<boolean> {
	try {
		// 1. 基本格式检查
		const [timestamp, receivedSignature] = token.split('.');
		if (!timestamp || !receivedSignature || receivedSignature.length !== 64) {
			console.error('Invalid token format');
			return false;
		}

		// 2. 时间戳验证（增加5分钟缓冲期）
		const tokenAge = Date.now() - parseInt(timestamp);
		const MAX_AGE = 30 * 60 * 1000; // 30分钟
		const GRACE_PERIOD = 5 * 60 * 1000; // 5分钟缓冲

		if (isNaN(tokenAge)) {
			console.error('Invalid timestamp in token');
			return false;
		}

		if (tokenAge > MAX_AGE + GRACE_PERIOD) {
			console.error(
				`Token expired. Age: ${tokenAge}ms, Max allowed: ${MAX_AGE}ms`,
			);
			return false;
		}

		// 3. 重新生成签名进行比较
		const expectedToken = await generateCsrfToken(userId);
		const [_, expectedSignature] = expectedToken.split('.');

		// 4. 安全比较
		return safeStringCompare(receivedSignature, expectedSignature);
	} catch (error) {
		console.error('CSRF verification error:', error);
		return false;
	}
}

// 安全字符串比较（防止时序攻击）
function safeStringCompare(a: string, b: string): boolean {
	const aBuf = new TextEncoder().encode(a);
	const bBuf = new TextEncoder().encode(b);
	if (aBuf.length !== bBuf.length) return false;

	let result = 0;
	for (let i = 0; i < aBuf.length; i++) {
		result |= aBuf[i] ^ bBuf[i];
	}
	return result === 0;
}

// 辅助函数：判断是否需要CSRF检查
export function shouldCheckCsrf(pathname: string, method: string): boolean {
	// 排除列表
	const EXCLUDED_PATHS = ['/api/auth', '/_next', '/static'];

	// 只保护这些方法
	const PROTECTED_METHODS = ['POST', 'PUT', 'PATCH', 'DELETE'];

	// 只保护特定HTTP方法
	return (
		!EXCLUDED_PATHS.some((path) => pathname.startsWith(path)) &&
		PROTECTED_METHODS.includes(method)
	);
}

// 辅助函数：从请求中获取CSRF令牌
export function getCsrfTokenFromRequest(request: NextRequest): string | null {
	// 1. 优先从header获取
	const headerToken = request.headers.get('X-CSRF-Token');
	if (headerToken) return headerToken;

	// 2. 从JSON body获取（适用于API请求）
	try {
		const body = request.json?.();
		// @ts-expect-error
		if (body?.csrf_token) return body?.csrf_token;
	} catch {
		// 不是JSON请求
	}

	// 3. 最后从cookie获取
	return request.cookies.get('csrf_token')?.value || null;
}
