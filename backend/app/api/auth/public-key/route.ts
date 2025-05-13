import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { NextResponse } from 'next/server';
import { ResponseWrapper } from 'docs-hub-shared-models';

export async function GET() {
	try {
		const publicKeyPath = join(process.cwd(), 'private/public.pem');
		const publicKey =
			process.env.RSA_PUBLIC_KEY || readFileSync(publicKeyPath, 'utf8');

		if (!publicKey) {
			return NextResponse.json(
				ResponseWrapper.error('Public key not configured'),
			);
		}

		return NextResponse.json(ResponseWrapper.success(publicKey));
	} catch (error) {
		return NextResponse.json(
			ResponseWrapper.error('Failed to retrieve public key'),
		);
	}
}
