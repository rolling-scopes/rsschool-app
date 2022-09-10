/* eslint-disable no-console */
import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  if (request.nextUrl.pathname === '/login') {
    return;
  }

  if (request.headers.get('x-domain') === 'job') {
    const pathname = request.nextUrl.pathname === '/' ? '' : request.nextUrl.pathname;
    NextResponse.rewrite(new URL(`/job${pathname}${request.nextUrl.search}`, request.url));
  }
}
