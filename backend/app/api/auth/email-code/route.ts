import { NextRequest, NextResponse } from 'next/server';
import { ResponseWrapper } from 'docs-hub-shared-models';
import { generateCode, transporter } from '@/lib/mailer';
import { redis } from '@/lib/redis';

export async function POST(req: NextRequest) {
	try {
		const { email } = await req.json();

		if (!email) {
			return NextResponse.json(ResponseWrapper.error('email is required'));
		}

		const code = generateCode();
		const key = `verify:${email}`;
		const ttl = parseInt(process.env.CODE_EXPIRE_SECONDS || '300');

		await redis.set(key, code, 'EX', ttl);

		await transporter.sendMail({
			from: `"${process.env.APP_NAME}" <${process.env.SMTP_USER}>`,
			to: email,
			subject: 'Your Verification Code',
			text: `Your verification code is: ${code}. It expires in ${ttl / 60} minutes.`,
		});

		return NextResponse.json(
			ResponseWrapper.success(true, 'Verification code sent'),
		);
	} catch (err) {
		return NextResponse.json(
			ResponseWrapper.error(err.message || 'get validate code failed'),
		);
	}
}
