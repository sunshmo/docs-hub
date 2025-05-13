import { jwtVerify, SignJWT } from 'jose';

export async function generateAuthCode(
	userId: string,
	accessToken: string,
): Promise<string> {
	return await new SignJWT({ sub: userId, accessToken })
		.setProtectedHeader({ alg: 'HS256' })
		.setExpirationTime(`${process.env.JWT_TOKEN_EXPIRE}m`)
		.setIssuedAt()
		.sign(new TextEncoder().encode(process.env.JWT_TOKEN_SECRET));
}

export async function validateAuthCode(code: string): Promise<string | null> {
	try {
		const { payload } = await jwtVerify(
			code,
			new TextEncoder().encode(process.env.JWT_TOKEN_SECRET),
		);
		return payload.sub as string;
	} catch {
		return null;
	}
}
