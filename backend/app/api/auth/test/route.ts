import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
	return NextResponse.redirect(new URL('/login', req.nextUrl.origin), 307);
}
