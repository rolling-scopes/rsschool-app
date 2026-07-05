import { message } from 'antd';
import { CoursesTasksApi } from '@client/api';
import { CheckService } from './check';

vi.mock('@client/api');

describe('CheckService', () => {
  const getBadCommentCheckers = vi.mocked(CoursesTasksApi.prototype.getBadCommentCheckers);
  const getMaxScoreCheckers = vi.mocked(CoursesTasksApi.prototype.getMaxScoreCheckers);
  let errorSpy: ReturnType<typeof vi.spyOn>;

  const badReview = [{ taskName: 't', checkerScore: 1, checkerGithubId: 'c', studentGithubId: 's' }];

  beforeEach(() => {
    vi.clearAllMocks();
    errorSpy = vi.spyOn(message, 'error').mockImplementation(() => ({}) as never);
  });

  afterEach(() => {
    errorSpy.mockRestore();
  });

  it('fetches "Bad comment" data via getBadCommentCheckers', async () => {
    getBadCommentCheckers.mockResolvedValueOnce({ data: badReview } as never);

    const result = await new CheckService().getData(1, 'Bad comment', 100);

    expect(getBadCommentCheckers).toHaveBeenCalledWith(100, 1);
    expect(result).toEqual(badReview);
  });

  it('fetches "Did not check" data via getMaxScoreCheckers', async () => {
    getMaxScoreCheckers.mockResolvedValueOnce({ data: badReview } as never);

    const result = await new CheckService().getData(2, 'Did not check', 200);

    expect(getMaxScoreCheckers).toHaveBeenCalledWith(200, 2);
    expect(result).toEqual(badReview);
  });

  it('returns an empty array and does not call the api for "No type"', async () => {
    const result = await new CheckService().getData(3, 'No type', 300);

    expect(result).toEqual([]);
    expect(getBadCommentCheckers).not.toHaveBeenCalled();
    expect(getMaxScoreCheckers).not.toHaveBeenCalled();
    expect(errorSpy).not.toHaveBeenCalled();
  });

  it('shows an error message and returns empty array for an unsupported type', async () => {
    const result = await new CheckService().getData(4, 'Unknown' as never, 400);

    expect(result).toEqual([]);
    expect(errorSpy).toHaveBeenCalledWith('Something went wrong');
  });

  it('shows an error message and returns empty array when the api rejects', async () => {
    getBadCommentCheckers.mockRejectedValueOnce(new Error('network'));

    const result = await new CheckService().getData(5, 'Bad comment', 500);

    expect(result).toEqual([]);
    expect(errorSpy).toHaveBeenCalledWith('Something went wrong');
  });

  it('caches results per task and type, avoiding a second api call', async () => {
    getBadCommentCheckers.mockResolvedValueOnce({ data: badReview } as never);
    const service = new CheckService();

    const first = await service.getData(7, 'Bad comment', 700);
    const second = await service.getData(7, 'Bad comment', 700);

    expect(getBadCommentCheckers).toHaveBeenCalledTimes(1);
    expect(first).toEqual(badReview);
    expect(second).toEqual(badReview);
  });

  it('caches different types under the same task separately', async () => {
    getBadCommentCheckers.mockResolvedValueOnce({ data: badReview } as never);
    getMaxScoreCheckers.mockResolvedValueOnce({ data: [] } as never);
    const service = new CheckService();

    await service.getData(8, 'Bad comment', 800);
    await service.getData(8, 'Did not check', 800);

    expect(getBadCommentCheckers).toHaveBeenCalledTimes(1);
    expect(getMaxScoreCheckers).toHaveBeenCalledTimes(1);
  });
});
