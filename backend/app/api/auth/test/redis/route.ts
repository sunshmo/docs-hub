import { NextRequest, NextResponse } from 'next/server';
import { redis } from '@/lib/redis';
import { ResponseWrapper } from 'docs-hub-shared-models';

export async function GET(req: NextRequest) {
  await redis.set('test', 'redis');

  return NextResponse.json(ResponseWrapper.success(await redis.get('test')));
}
