import { FilesApi } from '@client/api';
import { FilesService } from './files';

vi.mock('@client/api');

describe('FilesService', () => {
  const uploadFile = vi.mocked(FilesApi.prototype.uploadFile);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('parses the JSON payload and forwards it with the key', async () => {
    uploadFile.mockResolvedValueOnce({ data: { url: 'https://cdn/test' } } as never);

    const result = await new FilesService().uploadFile('my-key', '{"a":1,"b":"two"}');

    expect(uploadFile).toHaveBeenCalledWith({ a: 1, b: 'two' }, 'my-key');
    expect(result).toEqual({ url: 'https://cdn/test' });
  });

  it('propagates a parse error for invalid JSON', async () => {
    await expect(new FilesService().uploadFile('k', 'not-json')).rejects.toThrow();
    expect(uploadFile).not.toHaveBeenCalled();
  });
});
