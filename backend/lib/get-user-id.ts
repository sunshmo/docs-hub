import { NextRequest } from 'next/server';
import { getToken } from '@/lib/token';
import { verifyToken } from '@/lib/jwt';

export async function getUserId(req: NextRequest) {
  try {
    const token = getToken(req);

    if (!token) {
      throw new Error('token is required')
    }

    const userInfo = await verifyToken(token!);
    if (!userInfo) {
      throw new Error('userInfo is null');
    }

    return userInfo.id;
  } catch (err) {
    throw err;
  }
}
