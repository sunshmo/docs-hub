import { NextRequest, NextResponse } from 'next/server';
import { redis } from '@/lib/redis';
import { ResponseWrapper } from 'docs-hub-shared-models';

export async function POST(req: NextRequest) {
	const { email, code } = await req.json();
	if (!email || !code) {
		return NextResponse.json(
			ResponseWrapper.error('Email and code are required'),
			{ status: 400 },
		);
	}

	const savedCode = await redis.get(`verify:${email}`);
	if (!savedCode) {
		return NextResponse.json(
			ResponseWrapper.error('Code expired or not found'),
			{ status: 400 },
		);
	}

	if (savedCode !== code) {
		return NextResponse.json(
			ResponseWrapper.error('Invalid verification code'),
			{ status: 400 },
		);
	}

	await redis.del(`verify:${email}`);

	return NextResponse.json(ResponseWrapper.success(true));
}
