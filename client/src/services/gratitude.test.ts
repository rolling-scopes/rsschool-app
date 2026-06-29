import { GratitudesApi } from '@client/api';
import { GratitudeService } from './gratitude';

vi.mock('@client/api');

describe('GratitudeService', () => {
  const getGratitudes = vi.mocked(GratitudesApi.prototype.getGratitudes);

  beforeEach(() => {
    vi.clearAllMocks();
    getGratitudes.mockResolvedValue({ data: { content: [], count: 0 } } as never);
  });

  it('calls the api with undefined args when no request data is provided', async () => {
    const result = await new GratitudeService().getGratitude();

    expect(getGratitudes).toHaveBeenCalledWith(undefined, undefined, undefined, undefined, undefined);
    expect(result).toEqual({ content: [], count: 0 });
  });

  it('forwards filters and converts pagination to numbers', async () => {
    await new GratitudeService().getGratitude({
      name: 'Hero',
      githubId: 'hero1',
      courseId: 3,
      pageSize: 20,
      current: 2,
    });

    expect(getGratitudes).toHaveBeenCalledWith('Hero', 'hero1', 3, 20, 2);
  });

  it('passes undefined for pagination when pageSize/current are missing', async () => {
    await new GratitudeService().getGratitude({ name: 'Hero' });

    expect(getGratitudes).toHaveBeenCalledWith('Hero', undefined, undefined, undefined, undefined);
  });

  it('coerces string pagination values to numbers', async () => {
    await new GratitudeService().getGratitude({
      pageSize: '15' as unknown as number,
      current: '3' as unknown as number,
    });

    expect(getGratitudes).toHaveBeenCalledWith(undefined, undefined, undefined, 15, 3);
  });

  it('returns the api response content and count', async () => {
    getGratitudes.mockResolvedValueOnce({
      data: { content: [{ id: 1 }], count: 1 },
    } as never);

    const result = await new GratitudeService().getGratitude();

    expect(result).toEqual({ content: [{ id: 1 }], count: 1 });
  });
});
