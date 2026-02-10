import { MentorsHallOfFameApi, TopMentorDto } from 'api';
import { MentorsHallOfFameService } from './mentors-hall-of-fame.service';

jest.mock('api');

describe('MentorsHallOfFameService', () => {
  const getTopMentorsApiMock = MentorsHallOfFameApi.prototype.getTopMentors as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('calls API with provided allTime parameter', async () => {
    getTopMentorsApiMock.mockResolvedValueOnce({ data: [] });

    const service = new MentorsHallOfFameService();
    await service.getTopMentors(true);

    expect(getTopMentorsApiMock).toHaveBeenCalledWith(true);
  });

  it('returns data from successful API response', async () => {
    const mentors: TopMentorDto[] = [
      {
        rank: 1,
        githubId: 'mentor-1',
        name: 'Mentor One',
        totalStudents: 10,
        totalGratitudes: 4,
        courseStats: [],
      },
    ];
    getTopMentorsApiMock.mockResolvedValueOnce({ data: mentors });

    const service = new MentorsHallOfFameService();
    const result = await service.getTopMentors(false);

    expect(result).toEqual(mentors);
  });

  it('throws when API request fails', async () => {
    const requestError = new Error('API failed');
    getTopMentorsApiMock.mockRejectedValueOnce(requestError);

    const service = new MentorsHallOfFameService();

    await expect(service.getTopMentors()).rejects.toThrow('API failed');
  });
});
