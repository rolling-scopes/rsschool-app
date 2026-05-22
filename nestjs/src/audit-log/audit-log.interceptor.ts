import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import type { Request, Response } from 'express';
import { Observable, tap } from 'rxjs';
import { AuthUser } from '../auth';
import { AuditLogService } from './audit-log.service';

const REDACT_KEYS = new Set(['password', 'token', 'secret', 'authorization']);
const MAX_PAYLOAD_BYTES = 16_384;

export function redactPayload(input: unknown): unknown {
  if (input == null || typeof input !== 'object') return input;
  if (Array.isArray(input)) return input.map(redactPayload);

  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(input as Record<string, unknown>)) {
    if (REDACT_KEYS.has(key.toLowerCase())) {
      out[key] = '[redacted]';
    } else {
      out[key] = redactPayload(value);
    }
  }
  return out;
}

function toJsonObject(payload: unknown): Record<string, unknown> | null {
  if (payload == null) return null;
  try {
    const json = JSON.stringify(payload);
    if (json.length > MAX_PAYLOAD_BYTES) {
      return { _truncated: true, preview: json.slice(0, MAX_PAYLOAD_BYTES) };
    }
    if (payload && typeof payload === 'object' && !Array.isArray(payload)) {
      return payload as Record<string, unknown>;
    }
    return { _value: payload };
  } catch {
    return { _unserializable: true };
  }
}

@Injectable()
export class AuditLogInterceptor implements NestInterceptor {
  constructor(private readonly auditLog: AuditLogService) {}

  public intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    if (context.getType() !== 'http') {
      return next.handle();
    }
    const http = context.switchToHttp();
    const req = http.getRequest<Request & { user?: AuthUser }>();
    const user = req.user;

    if (!user?.apiTokenId) {
      return next.handle();
    }

    const startedAt = Date.now();
    const action = `${context.getClass().name}.${context.getHandler().name}`;
    const tokenId = user.apiTokenId;
    const userId = user.id;
    const payload = toJsonObject(redactPayload(req.body));

    const finalize = (status: number) => {
      this.auditLog.enqueue({
        userId,
        tokenId,
        action,
        method: req.method,
        path: req.originalUrl ?? req.url,
        requestPayload: payload,
        responseStatus: status,
        durationMs: Date.now() - startedAt,
        ip: req.ip ?? null,
        userAgent: req.headers['user-agent'] ?? null,
      });
    };

    return next.handle().pipe(
      tap({
        next: () => finalize(http.getResponse<Response>().statusCode ?? 200),
        error: err => {
          const status = typeof err?.status === 'number' ? err.status : 500;
          finalize(status);
        },
      }),
    );
  }
}
