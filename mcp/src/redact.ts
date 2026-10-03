/**
 * Output scrubbing for tool responses. Tools return backend JSON, and we don't
 * want secret-like fields (or, for some tools, personal contacts) flowing into
 * the model context verbatim. Key-based and recursive, so it survives backend
 * shape changes instead of relying on an exhaustive field allow-list.
 */

const SECRET_KEYS = new Set([
  'password',
  'passwordhash',
  'hash',
  'salt',
  'secret',
  'token',
  'accesstoken',
  'refreshtoken',
  'apitoken',
  'sessionid',
]);

/** True for keys that must never appear in tool output regardless of role. */
export function isSecretKey(key: string): boolean {
  return SECRET_KEYS.has(key.toLowerCase());
}

/** True for personal contact fields (contactsEmail, contactsPhone, …). */
export function isContactKey(key: string): boolean {
  return key.toLowerCase().startsWith('contacts');
}

/** Deep-clone `data`, dropping every object key for which `shouldDrop` is true. */
export function redactKeys<T>(data: T, shouldDrop: (key: string) => boolean): T {
  return redact(data, shouldDrop) as T;
}

/** Deep-clone `data`, dropping only secret/auth fields. Safe for any tool. */
export function redactSecrets<T>(data: T): T {
  return redact(data, isSecretKey) as T;
}

function redact(data: unknown, shouldDrop: (key: string) => boolean): unknown {
  if (Array.isArray(data)) {
    return data.map(item => redact(item, shouldDrop));
  }
  if (data && typeof data === 'object') {
    const out: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(data)) {
      if (shouldDrop(key)) {
        continue;
      }
      out[key] = redact(value, shouldDrop);
    }
    return out;
  }
  return data;
}
