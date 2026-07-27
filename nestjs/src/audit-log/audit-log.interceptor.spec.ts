import { CallHandler, ExecutionContext } from '@nestjs/common';
import { lastValueFrom, of, throwError } from 'rxjs';
import { vi } from 'vitest';
import type { AuthUser } from '../auth';
import { AuditLogInterceptor, readToolName, redactPayload } from './audit-log.interceptor';
import type { AuditLogService } from './audit-log.service';

function makeContext(opts: {
  user?: Partial<AuthUser>;
  body?: unknown;
  method?: string;
  url?: string;
  statusCode?: number;
  className?: string;
  handlerName?: string;
  toolName?: string | string[];
}): ExecutionContext {
  const req = {
    user: opts.user,
    body: opts.body,
    method: opts.method ?? 'POST',
    originalUrl: opts.url ?? '/x',
    url: opts.url ?? '/x',
    ip: '127.0.0.1',
    headers: { 'user-agent': 'vitest', ...(opts.toolName ? { 'x-mcp-tool': opts.toolName } : {}) },
  };
  const res = { statusCode: opts.statusCode ?? 200 };
  return {
    getType: () => 'http',
    switchToHttp: () => ({ getRequest: () => req, getResponse: () => res }),
    getClass: () => ({ name: opts.className ?? 'TestController' }) as never,
    getHandler: () => ({ name: opts.handlerName ?? 'handle' }) as never,
  } as unknown as ExecutionContext;
}

describe('redactPayload', () => {
  it('replaces forbidden keys with [redacted]', () => {
    expect(redactPayload({ name: 'ok', password: 'secret', nested: { token: 'abc' } })).toStrictEqual({
      name: 'ok',
      password: '[redacted]',
      nested: { token: '[redacted]' },
    });
  });

  it('walks arrays', () => {
    expect(redactPayload([{ secret: 'x' }, { keep: 1 }])).toStrictEqual([{ secret: '[redacted]' }, { keep: 1 }]);
  });

  it('returns primitives unchanged', () => {
    expect(redactPayload(42)).toBe(42);
    expect(redactPayload('hi')).toBe('hi');
    expect(redactPayload(null)).toBeNull();
  });
});

describe('AuditLogInterceptor', () => {
  let auditLog: AuditLogService;
  let interceptor: AuditLogInterceptor;

  beforeEach(() => {
    auditLog = { enqueue: vi.fn() } as unknown as AuditLogService;
    interceptor = new AuditLogInterceptor(auditLog);
  });

  it('writes an entry for PAT-authenticated requests', async () => {
    const ctx = makeContext({ user: { id: 7, apiTokenId: 'token-1' } as AuthUser, body: { x: 1 } });
    const next: CallHandler = { handle: () => of('result') };

    await lastValueFrom(interceptor.intercept(ctx, next));

    expect(auditLog.enqueue).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: 7,
        tokenId: 'token-1',
        action: 'TestController.handle',
        method: 'POST',
        path: '/x',
        responseStatus: 200,
        requestPayload: { x: 1 },
      }),
    );
  });

  it('skips requests without an apiTokenId', async () => {
    const ctx = makeContext({ user: { id: 7 } as AuthUser });
    const next: CallHandler = { handle: () => of('result') };

    await lastValueFrom(interceptor.intercept(ctx, next));

    expect(auditLog.enqueue).not.toHaveBeenCalled();
  });

  it('records the error status when the handler throws', async () => {
    const ctx = makeContext({ user: { id: 1, apiTokenId: 't' } as AuthUser });
    const next: CallHandler = { handle: () => throwError(() => Object.assign(new Error('nope'), { status: 403 })) };

    await expect(lastValueFrom(interceptor.intercept(ctx, next))).rejects.toThrow('nope');

    expect(auditLog.enqueue).toHaveBeenCalledWith(expect.objectContaining({ responseStatus: 403 }));
  });

  it('redacts sensitive fields in the request payload', async () => {
    const ctx = makeContext({
      user: { id: 1, apiTokenId: 't' } as AuthUser,
      body: { name: 'ok', password: 'p' },
    });
    const next: CallHandler = { handle: () => of('ok') };

    await lastValueFrom(interceptor.intercept(ctx, next));

    expect(auditLog.enqueue).toHaveBeenCalledWith(
      expect.objectContaining({ requestPayload: { name: 'ok', password: '[redacted]' } }),
    );
  });
});

describe('readToolName', () => {
  it('returns null when the header is absent', () => {
    expect(readToolName(undefined)).toBeNull();
    expect(readToolName('')).toBeNull();
  });

  it('accepts a plain tool identifier', () => {
    expect(readToolName('issue_certificate')).toBe('issue_certificate');
    expect(readToolName('  list_my_courses  ')).toBe('list_my_courses');
  });

  it('takes the first value when the header repeats', () => {
    expect(readToolName(['get_my_score', 'other'])).toBe('get_my_score');
  });

  it('rejects values that are not tool identifiers', () => {
    expect(readToolName('drop table audit_log')).toBeNull();
    expect(readToolName('../../etc/passwd')).toBeNull();
  });

  it('truncates an over-long value to the column width', () => {
    expect(readToolName('a'.repeat(150))).toHaveLength(100);
  });
});

describe('AuditLogInterceptor tool attribution', () => {
  it('stores the MCP tool name when the header is present', async () => {
    const auditLog = { enqueue: vi.fn() } as unknown as AuditLogService;
    const interceptor = new AuditLogInterceptor(auditLog);
    const next: CallHandler = { handle: () => of('ok') };
    await lastValueFrom(
      interceptor.intercept(
        makeContext({ user: { id: 1, apiTokenId: 'token-1' } as Partial<AuthUser>, toolName: 'issue_certificate' }),
        next,
      ),
    );
    expect(auditLog.enqueue).toHaveBeenCalledWith(expect.objectContaining({ toolName: 'issue_certificate' }));
  });

  it('stores null for a PAT call made outside MCP', async () => {
    const auditLog = { enqueue: vi.fn() } as unknown as AuditLogService;
    const interceptor = new AuditLogInterceptor(auditLog);
    const next: CallHandler = { handle: () => of('ok') };
    await lastValueFrom(
      interceptor.intercept(makeContext({ user: { id: 1, apiTokenId: 'token-1' } as Partial<AuthUser> }), next),
    );
    expect(auditLog.enqueue).toHaveBeenCalledWith(expect.objectContaining({ toolName: null }));
  });
});
