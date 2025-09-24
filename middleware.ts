export const runtime = "nodejs";

import { NextRequest, NextResponse } from 'next/server';
import createMiddleware from 'next-intl/middleware';
import {locales, defaultLocale} from './i18n';

const PROTECTED_PATHS = ['/dashboard', '/report'];

// Create the intl middleware
const intlMiddleware = createMiddleware({
  locales,
  defaultLocale,
  localeDetection: true
});

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  
  // Handle internationalization first
  const intlResponse = intlMiddleware(req);
  
  // Extract locale from pathname for protected path checking
  const segments = pathname.split('/');
  const maybeLocale = segments[1];
  const isLocaleInPath = locales.includes(maybeLocale);
  const actualPath = isLocaleInPath ? '/' + segments.slice(2).join('/') : pathname;
  
  // Check if the path (without locale) is protected
  const isProtected = PROTECTED_PATHS.some((path) => actualPath.startsWith(path));
  
  if (isProtected) {
    const idToken = req.cookies.get('idToken')?.value;
    if (!idToken) {
      const url = req.nextUrl.clone();
      url.pathname = isLocaleInPath ? `/${maybeLocale}` : '/';
      return NextResponse.redirect(url);
    }
  }
  
  return intlResponse;
}

export const config = {
  matcher: ['/', '/(hi|bn|te|mr|ta|ur|gu|kn|ml|or|pa|as|mai|sa|sat|ks|ne|sd|gom|mni|doi|brx)/:path*', '/dashboard/:path*', '/report/:path*'],
};