import { vi } from 'vitest';

const push = vi.fn();
const replace = vi.fn();
const back = vi.fn();

export const useRouter = vi.fn(() => ({
  push,
  replace,
  back,
  query: {},
  pathname: '/',
  asPath: '/',
}));

export default { useRouter };
