import { CoursesApi } from '@client/api';
import { CdnService } from './cdn';

vi.mock('@client/api');

describe('CdnService', () => {
  const getCourses = vi.mocked(CoursesApi.prototype.getCourses);

  const makeClient = () => ({
    post: vi.fn(),
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getCourses', () => {
    it('returns the courses data on success', async () => {
      getCourses.mockResolvedValueOnce({ data: [{ id: 1 }, { id: 2 }] } as never);

      const result = await new CdnService(makeClient() as never).getCourses();

      expect(result).toEqual([{ id: 1 }, { id: 2 }]);
    });

    it('returns an empty array when the api throws', async () => {
      getCourses.mockRejectedValueOnce(new Error('boom'));

      const result = await new CdnService(makeClient() as never).getCourses();

      expect(result).toEqual([]);
    });
  });

  describe('registerStudent', () => {
    it('posts the payload to the registry endpoint and returns data', async () => {
      const client = makeClient();
      client.post.mockResolvedValueOnce({ data: { ok: true } });

      const result = await new CdnService(client as never).registerStudent({ name: 'A' });

      expect(client.post).toHaveBeenCalledWith('/api/v2/registry', { name: 'A' });
      expect(result).toEqual({ ok: true });
    });
  });

  describe('registerMentor', () => {
    it('posts the payload to the mentor registry endpoint and returns data', async () => {
      const client = makeClient();
      client.post.mockResolvedValueOnce({ data: { ok: true } });

      const result = await new CdnService(client as never).registerMentor({ name: 'B' });

      expect(client.post).toHaveBeenCalledWith('/api/v2/registry/mentor', { name: 'B' });
      expect(result).toEqual({ ok: true });
    });
  });
});
