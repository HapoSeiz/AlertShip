export const runtime = "nodejs";

import { NextRequest, NextResponse } from 'next/server';

const PROTECTED_PATHS = ['/dashboard', '/report'];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (!PROTECTED_PATHS.some((path) => pathname.startsWith(path))) {
    return NextResponse.next();
  }
  const idToken = req.cookies.get('idToken')?.value;
  if (!idToken) {
    const url = req.nextUrl.clone();
    url.pathname = '/';
    
    return NextResponse.redirect(url);
  }
  // Do not verify the idToken here; just check presence
  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/report/:path*'],
}; 