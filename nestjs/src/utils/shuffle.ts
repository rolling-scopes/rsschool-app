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
  if (a.length !== b.length) return false;

  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) {
      return true;
    }
  }

  return false;
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

export function shuffleRec<T>(arr: T[], maxAttempts: number | undefined = 1000): T[] {
  if (arr.length <= 1) {
    return [...arr];
  }

  const first = arr[0];
  if (arr.every(el => el === first)) {
    return [...arr];
  }

  let attempts = 0;
  let res = shuffle(arr);

  while (!isShuffledArrays(arr, res) && attempts < maxAttempts) {
    res = shuffle(arr);
    attempts++;
  }

  return res;
}
