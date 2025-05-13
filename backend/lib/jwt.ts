import { SignJWT, jwtVerify, type JWTPayload } from 'jose';

// 1. 类型定义
export interface JwtPayload extends JWTPayload {
	id: string;
	username: string;
	email: string;
	telephone: string;
}

// 2. 直接从 process.env 获取（带验证）
function getJwtSecret() {
	const secret = process.env.JWT_SECRET;
	if (!secret) {
		throw new Error('JWT_SECRET is not defined in environment variables');
	}
	const encoded = new TextEncoder().encode(secret);
	if (encoded.byteLength < 32) {
		console.warn('JWT secret should be at least 32 characters long');
	}
	return encoded;
}

// 3. 初始化密钥
const ACCESS_SECRET = getJwtSecret();
const REFRESH_SECRET = new TextEncoder().encode(
	process.env.JWT_SECRET + '_REFRESH',
);

// 4. 签名函数
export async function signAccessToken(payload: JwtPayload): Promise<string> {
	return await new SignJWT(payload)
		.setProtectedHeader({ alg: 'HS256' })
		.setIssuedAt()
		.setExpirationTime('15m')
		.sign(ACCESS_SECRET);
}

export async function signRefreshToken(payload: JwtPayload): Promise<string> {
	return await new SignJWT(payload)
		.setProtectedHeader({ alg: 'HS256' })
		.setIssuedAt()
		.setExpirationTime('7d')
		.sign(REFRESH_SECRET);
}

// 5. 验证函数（带完整类型转换）
export async function verifyToken(
	token: string,
	options?: { isRefreshToken?: boolean },
): Promise<JwtPayload | null> {
	try {
		const secret = options?.isRefreshToken ? REFRESH_SECRET : ACCESS_SECRET;
		const { payload } = await jwtVerify(token, secret);

		// 类型安全转换
		if (
			typeof payload.id !== 'string' ||
			typeof payload.username !== 'string'
		) {
			throw new Error('Invalid token payload structure');
		}

		return {
			id: payload.id,
			username: payload.username,
			...payload, // 保留其他标准字段
		} as JwtPayload;
	} catch (err) {
		console.error(
			'[JWT] Verification failed:',
			err instanceof Error ? err.message : err,
		);
		return null;
	}
}
