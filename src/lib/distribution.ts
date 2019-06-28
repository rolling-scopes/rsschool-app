import * as crypto from 'crypto';

export function shuffle(arr: any[]): any[] {
  const copy = [...arr];
  let n = copy.length;
  const random = new Uint8Array(n);
  const bytes = crypto.randomBytes(random.length);
  random.set(bytes);

  while (n > 1) {
    const k = random[n - 1] % n;
    const t = copy[--n];
    copy[n] = copy[k];
    copy[k] = t;
  }

  return copy;
}
