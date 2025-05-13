import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
	// - http://localhost:3456/api/auth/redirect --> http://localhost:3456/login
	// - `/api/auth/callback/route.ts`
	return NextResponse.redirect(new URL('/login', req.nextUrl.origin), 307);
}
