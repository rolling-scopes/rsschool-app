import { AxiosError } from 'axios';
import { RegistryApi } from '@client/api';
import { MentorRegistryService } from './mentorRegistry';
import { MentorRegistryTabsMode } from '@client/modules/MentorRegistry/constants';

vi.mock('@client/api');

describe('MentorRegistryService', () => {
  const getMentorRegistries = vi.mocked(RegistryApi.prototype.getMentorRegistries);
  const approveMentor = vi.mocked(RegistryApi.prototype.approveMentor);
  const cancelMentorRegistry = vi.mocked(RegistryApi.prototype.cancelMentorRegistry);
  const commentMentorRegistry = vi.mocked(RegistryApi.prototype.commentMentorRegistry);
  const getOwnMentorRegistry = vi.mocked(RegistryApi.prototype.getOwnMentorRegistry);
  const inviteMentors = vi.mocked(RegistryApi.prototype.inviteMentors);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getMentors', () => {
    it('calls the api without arguments when no options are provided', async () => {
      getMentorRegistries.mockResolvedValueOnce({ data: { mentors: [], total: 0 } } as never);

      const result = await new MentorRegistryService().getMentors();

      expect(getMentorRegistries).toHaveBeenCalledWith();
      expect(result).toEqual({ mentors: [], total: 0 });
    });

    it('forwards all options in the expected order', async () => {
      getMentorRegistries.mockResolvedValueOnce({ data: { mentors: [], total: 0 } } as never);

      await new MentorRegistryService().getMentors({
        status: MentorRegistryTabsMode.New,
        currentPage: 2,
        pageSize: 25,
        githubId: 'g',
        cityName: 'c',
        preferedCourses: [1],
        preselectedCourses: [2],
        technicalMentoring: ['js'],
      });

      expect(getMentorRegistries).toHaveBeenCalledWith(MentorRegistryTabsMode.New, 25, 2, 'g', 'c', [1], [2], ['js']);
    });
  });

  describe('updateMentor', () => {
    it('approves the mentor with the preselected courses', async () => {
      approveMentor.mockResolvedValueOnce({} as never);

      await new MentorRegistryService().updateMentor('g', { preselectedCourses: ['1', '2'] });

      expect(approveMentor).toHaveBeenCalledWith('g', { preselectedCourses: ['1', '2'] });
    });
  });

  describe('cancelMentorRegistry', () => {
    it('cancels by github id', async () => {
      cancelMentorRegistry.mockResolvedValueOnce({} as never);

      await new MentorRegistryService().cancelMentorRegistry('g');

      expect(cancelMentorRegistry).toHaveBeenCalledWith('g');
    });
  });

  describe('sendCommentMentorRegistry', () => {
    it('sends the comment for the github id', async () => {
      commentMentorRegistry.mockResolvedValueOnce({} as never);

      await new MentorRegistryService().sendCommentMentorRegistry('g', 'hello');

      expect(commentMentorRegistry).toHaveBeenCalledWith('g', { comment: 'hello' });
    });
  });

  describe('getMentor', () => {
    it('returns the own mentor registry data', async () => {
      const data = {
        preselectedCourses: [1],
        maxStudentsLimit: 5,
        preferedStudentsLocation: 'any',
        preferredCourses: [2],
      };
      getOwnMentorRegistry.mockResolvedValueOnce({ data } as never);

      const result = await new MentorRegistryService().getMentor();

      expect(result).toEqual(data);
    });

    it('returns null when the mentor is not found (404)', async () => {
      const error = new AxiosError('Not found');
      error.response = { status: 404 } as never;
      getOwnMentorRegistry.mockRejectedValueOnce(error);
      const infoSpy = vi.spyOn(console, 'info').mockImplementation(() => {});

      const result = await new MentorRegistryService().getMentor();

      expect(result).toBeNull();
      expect(infoSpy).toHaveBeenCalled();
      infoSpy.mockRestore();
    });

    it('rethrows AxiosError with a non-404 status', async () => {
      const error = new AxiosError('Server error');
      error.response = { status: 500 } as never;
      getOwnMentorRegistry.mockRejectedValueOnce(error);

      await expect(new MentorRegistryService().getMentor()).rejects.toBe(error);
    });

    it('rethrows non-axios errors', async () => {
      const error = new Error('generic');
      getOwnMentorRegistry.mockRejectedValueOnce(error);

      await expect(new MentorRegistryService().getMentor()).rejects.toBe(error);
    });
  });

  describe('inviteMentors', () => {
    it('forwards the invite payload', async () => {
      inviteMentors.mockResolvedValueOnce({} as never);
      const payload = { mentors: [] } as never;

      await new MentorRegistryService().inviteMentors(payload);

      expect(inviteMentors).toHaveBeenCalledWith(payload);
    });
  });
});
