import { NextRequest, NextResponse } from 'next/server';

/**
 * Production host routing:
 * sallaclone.com -> public marketing website
 * app.sallaclone.com -> common OW Platform application (ERP + SaaS Admin + Customer Portal)
 */
export function middleware(request: NextRequest) {
  const host = (request.headers.get('host') || '').split(':')[0].toLowerCase();
  const { pathname } = request.nextUrl;

  if (host === 'app.sallaclone.com' && pathname === '/') {
    const url = request.nextUrl.clone();
    url.pathname = '/dashboard';
    return NextResponse.redirect(url);
  }

  const appRoute = pathname === '/login' || pathname === '/register' ||
    ['/dashboard', '/saas', '/website', '/settings', '/sales', '/products',
     '/purchases', '/reports', '/hrm', '/accounting', '/inventory',
     '/customer', '/supplier', '/user', '/pos', '/api'].some((prefix) =>
       pathname === prefix || pathname.startsWith(`${prefix}/`));

  if (host === 'sallaclone.com' && appRoute) {
    const url = request.nextUrl.clone();
    url.hostname = 'app.sallaclone.com';
    url.protocol = 'https:';
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)'],
};
