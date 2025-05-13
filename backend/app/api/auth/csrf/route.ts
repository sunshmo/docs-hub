import { NextRequest, NextResponse } from 'next/server';
import { generateCsrfToken } from '@/lib/csrf';
import { CsrfTokenOptions } from '@/lib/token';
import { ResponseWrapper } from 'docs-hub-shared-models';

export async function GET(req: NextRequest) {
	try {
		const token = await generateCsrfToken();

		const response = NextResponse.json(ResponseWrapper.success(token));

		// 设置HttpOnly=false让前端能读取
		response.cookies.set('csrf_token', token, CsrfTokenOptions);

		return response;
	} catch (error) {
		return NextResponse.json(
			ResponseWrapper.error('Failed to generate CSRF token'),
		);
	}
}
