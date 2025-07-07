import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const ID_TOKEN_COOKIE_NAME = 'idToken';

export async function POST() {
  cookies().set({
    name: ID_TOKEN_COOKIE_NAME,
    value: '',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 0,
    sameSite: 'strict',
  });
  return NextResponse.json({ success: true });
} 