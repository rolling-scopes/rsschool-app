import { randomBytes } from 'crypto';

class Generator {
  buff: Uint8Array;
  constructor(size: number) {
    this.buff = new Uint8Array(size);
    const bytes = randomBytes(this.buff.length);
    this.buff.set(bytes);
  }

  next(n: number) {
    const val = this.buff[n - 1];
    if (val === undefined) {
      throw new Error('Index out of bounds');
    }
    return val % n;
  }
}

export function isShuffledArrays<T>(a: T[], b: T[]): boolean {
  const len = Math.min(a.length, b.length);

  for (let i = 0; i < len; i++) {
    if (a[i] === b[i]) {
      return false;
    }
  }

  return true;
}

function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];

  let n = copy.length;
  const generator = new Generator(n);

  while (n > 1) {
    const randomIndex = generator.next(n--);
    const el = copy[n] as T;
    const targetEl = copy[randomIndex] as T;

    copy[n] = targetEl;
    copy[randomIndex] = el;
  }

  return copy;
}

export function shuffleRec<T>(arr: T[]): T[] {
  const res = shuffle(arr);
  return isShuffledArrays(arr, res) ? res : shuffleRec(arr);
}
