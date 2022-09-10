/* eslint-disable no-console */
import { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  console.info('Middleware', 'Next URL', request.nextUrl);
  console.info('Middleware', 'Headers', request.headers);
}

export const config = {
  matcher: '/course/:path*',
};
