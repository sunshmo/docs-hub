import { randomUUID } from 'crypto';
import { NextRequest, NextResponse } from 'next/server';

// 生成 UUIDv4
const newUUID = randomUUID();

export async function GET(req: NextRequest) {
	return NextResponse.json(newUUID);
}
