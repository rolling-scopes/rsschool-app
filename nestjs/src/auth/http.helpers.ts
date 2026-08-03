import { HttpAdapterHost } from '@nestjs/core';
import { serialize } from 'cookie';
import { JWT_COOKIE_NAME } from './constants';

type HttpAdapter = HttpAdapterHost['httpAdapter'];

const COOKIE_PATH = '/';
const twoDaysMs = 1000 * 60 * 60 * 24 * 2;

/**
 * Auth cookie/redirect helpers on top of the http adapter, so the auth
 * controller works on any Nest platform (#1123). cookie.serialize produces
 * byte-identical Set-Cookie values to the express res.cookie/clearCookie
 * calls these replaced (pinned by the HTTP smoke suite).
 */
export function setAuthCookie(httpAdapter: HttpAdapter, response: unknown, token: string, domain: string | undefined) {
  const value = serialize(JWT_COOKIE_NAME, token, {
    expires: new Date(Date.now() + twoDaysMs),
    httpOnly: true,
    secure: true,
    domain,
    sameSite: 'none',
    path: COOKIE_PATH,
  });
  httpAdapter.setHeader(response, 'Set-Cookie', value);
}

/** Session cookie for the local dev login: plain http, no cross-site attributes. */
export function setDevAuthCookie(httpAdapter: HttpAdapter, response: unknown, token: string) {
  const value = serialize(JWT_COOKIE_NAME, token, { httpOnly: true, path: COOKIE_PATH });
  httpAdapter.setHeader(response, 'Set-Cookie', value);
}

export function clearAuthCookie(httpAdapter: HttpAdapter, response: unknown, domain: string | undefined) {
  const value = serialize(JWT_COOKIE_NAME, '', { domain, path: COOKIE_PATH, expires: new Date(0) });
  httpAdapter.setHeader(response, 'Set-Cookie', value);
}

export function redirect(httpAdapter: HttpAdapter, response: unknown, url: string) {
  httpAdapter.redirect(response, 302, url);
}
