import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  // eslint-disable-next-line no-console
  console.info('Middleware', request.nextUrl);
  if (request.nextUrl.pathname.includes('/course/score')) {
    return NextResponse.rewrite(new URL(`/course/schedule${request.nextUrl.search}`, request.nextUrl.origin));
  }
}

export const config = {
  matcher: '/course/:path*',
};
