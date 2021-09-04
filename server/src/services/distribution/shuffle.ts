import { randomBytes } from 'crypto';

class Generator {
  buff: Uint8Array;
  constructor(size: number) {
    this.buff = new Uint8Array(size);
    const bytes = randomBytes(this.buff.length);
    this.buff.set(bytes);
  }

  next(n: number) {
    return this.buff[n - 1] % n;
  }
}

export function isShuffledArrays(a: any[], b: any[]): boolean {
  const len = Math.min(a.length, b.length);

  for (let i = 0; i < len; i++) {
    if (a[i] === b[i]) {
      return false;
    }
  }

  return true;
}

function shuffle(arr: any[]): any[] {
  const copy = [...arr];

  let n = copy.length;
  const generator = new Generator(n);

  while (n > 1) {
    const randomIndex = generator.next(n--);
    const el = copy[n];

    copy[n] = copy[randomIndex];
    copy[randomIndex] = el;
  }

  return copy;
}

export function shuffleRec<T = any>(arr: T[]): T[] {
  const res = shuffle(arr);
  return isShuffledArrays(arr, res) ? res : shuffleRec(arr);
}
