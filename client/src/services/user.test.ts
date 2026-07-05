import { ProfileApi, UsersApi, UsersNotificationsApi } from '@client/api';
import discordIntegration from '../configs/discord-integration';
import { UserService } from './user';

vi.mock('@client/api');

const ok = (data: unknown = undefined) => ({ data }) as never;

describe('UserService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getDiscordIds', () => {
    const setHash = (hash: string) => {
      Object.defineProperty(window, 'location', {
        value: { ...window.location, hash },
        writable: true,
        configurable: true,
      });
    };

    afterEach(() => {
      setHash('');
      vi.unstubAllGlobals();
    });

    it('returns null when there is no access_token in the url hash', async () => {
      setHash('#nothing=here');
      const result = await new UserService().getDiscordIds();
      expect(result).toBeNull();
    });

    it('fetches the discord profile when an access_token is present', async () => {
      setHash('#access_token=abc&token_type=Bearer');
      const json = vi.fn().mockResolvedValue({ username: 'user', discriminator: '0001', id: '123' });
      const fetchMock = vi.fn().mockResolvedValue({ json });
      vi.stubGlobal('fetch', fetchMock);

      const result = await new UserService().getDiscordIds();

      expect(fetchMock).toHaveBeenCalledWith(discordIntegration.api.me, {
        headers: { authorization: 'Bearer abc' },
      });
      expect(result).toEqual({ username: 'user', discriminator: '0001', id: '123' });
    });
  });

  it('getCourses returns the user courses for "me"', async () => {
    vi.mocked(ProfileApi.prototype.getUserCourses).mockResolvedValueOnce(ok([{ id: 1 }]));
    const result = await new UserService().getCourses();
    expect(ProfileApi.prototype.getUserCourses).toHaveBeenCalledWith('me');
    expect(result).toEqual([{ id: 1 }]);
  });

  describe('searchUser', () => {
    it('returns an empty array for a null query without hitting the api', async () => {
      const result = await new UserService().searchUser(null);
      expect(result).toEqual([]);
      expect(UsersApi.prototype.searchUsersBasic).not.toHaveBeenCalled();
    });

    it('returns search results for a query', async () => {
      vi.mocked(UsersApi.prototype.searchUsersBasic).mockResolvedValueOnce(ok([{ id: 1 }]));
      const result = await new UserService().searchUser('john');
      expect(UsersApi.prototype.searchUsersBasic).toHaveBeenCalledWith('john');
      expect(result).toEqual([{ id: 1 }]);
    });

    it('returns an empty array when the api throws', async () => {
      vi.mocked(UsersApi.prototype.searchUsersBasic).mockRejectedValueOnce(new Error('x'));
      const result = await new UserService().searchUser('john');
      expect(result).toEqual([]);
    });
  });

  it('getMyProfile returns the profile data', async () => {
    vi.mocked(ProfileApi.prototype.getMyProfile).mockResolvedValueOnce(ok({ githubId: 'gh' }));
    const result = await new UserService().getMyProfile();
    expect(result).toEqual({ githubId: 'gh' });
  });

  it('getProfileInfo returns the full profile for a github id', async () => {
    vi.mocked(ProfileApi.prototype.getFullProfileInfo).mockResolvedValueOnce(ok({ discord: null }));
    const result = await new UserService().getProfileInfo('gh');
    expect(ProfileApi.prototype.getFullProfileInfo).toHaveBeenCalledWith('gh');
    expect(result).toEqual({ discord: null });
  });

  it('sendEmailConfirmationLink delegates to the notifications api', async () => {
    vi.mocked(UsersNotificationsApi.prototype.sendEmailConfirmationLink).mockResolvedValueOnce(ok());
    await new UserService().sendEmailConfirmationLink();
    expect(UsersNotificationsApi.prototype.sendEmailConfirmationLink).toHaveBeenCalledTimes(1);
  });
});
