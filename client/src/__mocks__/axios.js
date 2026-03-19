import { vi } from 'vitest';

const mockAxios = {
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
  patch: vi.fn(),
  delete: vi.fn(),
  create: vi.fn(() => mockAxios),
  defaults: { headers: { common: {} } },
  interceptors: {
    request: { use: vi.fn(), eject: vi.fn() },
    response: { use: vi.fn(), eject: vi.fn() },
  },
  reset() {
    this.get.mockReset();
    this.post.mockReset();
    this.put.mockReset();
    this.patch.mockReset();
    this.delete.mockReset();
  },
};

export default mockAxios;
