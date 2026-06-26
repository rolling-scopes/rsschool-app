import { act, renderHook, waitFor } from '@testing-library/react';
import { message } from 'antd';
import { useMentorData } from './useMentorData';

// Boundary mocks: the hook orchestrates UserService / CdnService / DisciplinesApi (data load)
// and ProfileApi + CdnService (submit). We mock those service classes so the hook's real
// orchestration logic (active-course filtering, initial values, multi-step submit, error
// handling) runs against deterministic data. `@client/api` keeps its real enum value.
const { getMyProfile, getCourses, getDisciplines, registerMentor, updateUser } = vi.hoisted(() => ({
  getMyProfile: vi.fn(),
  getCourses: vi.fn(),
  getDisciplines: vi.fn(),
  registerMentor: vi.fn(),
  updateUser: vi.fn(),
}));

vi.mock('@client/services/user', () => ({
  UserService: class {
    getMyProfile = getMyProfile;
  },
}));

vi.mock('@client/services/cdn', () => ({
  CdnService: class {
    getCourses = getCourses;
    registerMentor = registerMentor;
  },
}));

vi.mock('@client/api', async importOriginal => {
  const actual = await importOriginal<typeof import('@client/api')>();
  return {
    ...actual,
    DisciplinesApi: class {
      getDisciplines = getDisciplines;
    },
    ProfileApi: class {
      updateUser = updateUser;
    },
  };
});

vi.mock('antd', async importOriginal => {
  const actual = await importOriginal<typeof import('antd')>();
  return { ...actual, message: { ...actual.message, error: vi.fn() } };
});

const profile = {
  countryName: 'Belarus',
  cityName: 'Minsk',
  languages: ['English'],
  firstName: 'Ada',
  lastName: 'Lovelace',
  primaryEmail: 'ada@example.com',
  contactsEpamEmail: 'ada@epam.com',
  contactsTelegram: 'ada_tg',
  contactsSkype: 'ada_skype',
  contactsWhatsApp: 'ada_wa',
  contactsEmail: 'ada2@example.com',
  contactsNotes: 'notes',
  contactsPhone: '+123456789',
  aboutMyself: 'about me',
};

const courses = [
  // mentoring + active + not invite-only => kept
  {
    id: 1,
    alias: 'js-2024',
    name: 'JS',
    startDate: '2024-03-01',
    completed: false,
    planned: false,
    inviteOnly: false,
    personalMentoring: true,
  },
  // completed and not planned => filtered out
  {
    id: 2,
    alias: 'old',
    name: 'Old',
    startDate: '2023-01-01',
    completed: true,
    planned: false,
    inviteOnly: false,
    personalMentoring: true,
  },
  // no personalMentoring => filtered out
  {
    id: 3,
    alias: 'react',
    name: 'React',
    startDate: '2024-01-01',
    completed: false,
    planned: false,
    inviteOnly: false,
    personalMentoring: false,
  },
];

const disciplines = [{ id: 10, name: 'JavaScript' }];

beforeEach(() => {
  vi.clearAllMocks();
  getMyProfile.mockResolvedValue(profile);
  getCourses.mockResolvedValue(courses);
  getDisciplines.mockResolvedValue({ data: disciplines });
  updateUser.mockResolvedValue({});
  registerMentor.mockResolvedValue({});
});

async function renderLoaded(courseAlias?: string | string[]) {
  const view = renderHook(() => useMentorData(courseAlias));
  await waitFor(() => expect(view.result.current.loading).toBe(false));
  return view;
}

describe('useMentorData', () => {
  test('loads profile-derived initial values into resume', async () => {
    const { result } = await renderLoaded();

    expect(result.current.resume).toMatchObject({
      firstName: 'Ada',
      lastName: 'Lovelace',
      primaryEmail: 'ada@example.com',
      contactsTelegram: 'ada_tg',
      location: { countryName: 'Belarus', cityName: 'Minsk' },
      languagesMentoring: ['English'],
      maxStudentsLimit: 2,
      preferedStudentsLocation: 'any',
      technicalMentoring: [],
      preferedCourses: [], // no alias => none preselected
    });
  });

  test('builds the General/Mentorship/Done steps', async () => {
    const { result } = await renderLoaded();

    expect(result.current.steps.map(s => s.title)).toEqual(['General', 'Mentorship', 'Done']);
  });

  test('starts on the first step', async () => {
    const { result } = await renderLoaded();

    expect(result.current.currentStep).toBe(0);
  });

  test('preselects courses when a single alias is supplied', async () => {
    const { result } = await renderLoaded('js-2024');

    expect(result.current.resume?.preferedCourses).toEqual([1]);
  });

  test('matches multiple aliases when an array is supplied', async () => {
    const { result } = await renderLoaded(['js-2024', 'react']);

    expect(result.current.resume?.preferedCourses).toEqual([1, 3]);
  });

  test('first submit only advances the step without calling the API', async () => {
    const { result } = await renderLoaded();

    await act(async () => {
      await result.current.handleSubmit({ firstName: 'New' } as never);
    });

    expect(result.current.currentStep).toBe(1);
    expect(updateUser).not.toHaveBeenCalled();
    expect(registerMentor).not.toHaveBeenCalled();
  });

  test('second submit posts the user and mentor registry payloads and advances to Done', async () => {
    const { result } = await renderLoaded();

    // advance to mentorship step
    await act(async () => {
      await result.current.handleSubmit({} as never);
    });

    await act(async () => {
      await result.current.handleSubmit({
        technicalMentoring: ['frontend'],
        preferedCourses: [1],
        preferedStudentsLocation: 'city',
        maxStudentsLimit: 5,
        languagesMentoring: ['English', 'Russian'],
        location: { countryName: 'Poland', cityName: 'Warsaw' },
        firstName: 'Ada',
        lastName: 'L',
        primaryEmail: 'a@b.c',
        contactsEpamEmail: 'a@epam.com',
        contactsTelegram: 'tg',
        contactsSkype: 'sk',
        contactsWhatsApp: 'wa',
        contactsEmail: 'e@e.e',
        contactsNotes: 'n',
        contactsPhone: '+1',
        aboutMyself: 'me',
      } as never);
    });

    expect(registerMentor).toHaveBeenCalledWith({
      preferedCourses: [1],
      maxStudentsLimit: 5,
      preferedStudentsLocation: 'city',
      languagesMentoring: ['English', 'Russian'],
      technicalMentoring: ['frontend'],
    });
    expect(updateUser).toHaveBeenCalledWith(
      expect.objectContaining({
        firstName: 'Ada',
        cityName: 'Warsaw',
        countryName: 'Poland',
        languages: ['English', 'Russian'],
        aboutMyself: 'me',
      }),
    );
    expect(result.current.currentStep).toBe(2);
  });

  test('falls back to empty city/country when no location is set on submit', async () => {
    const { result } = await renderLoaded();

    await act(async () => {
      await result.current.handleSubmit({} as never);
    });
    await act(async () => {
      await result.current.handleSubmit({ location: null, languagesMentoring: [] } as never);
    });

    expect(updateUser).toHaveBeenCalledWith(expect.objectContaining({ cityName: '', countryName: '' }));
  });

  test('shows an error message and stays on the mentorship step when submit fails', async () => {
    registerMentor.mockRejectedValueOnce(new Error('boom'));
    const { result } = await renderLoaded();

    await act(async () => {
      await result.current.handleSubmit({} as never);
    });
    await act(async () => {
      await result.current.handleSubmit({ languagesMentoring: [] } as never);
    });

    expect(message.error).toHaveBeenCalledWith('An error occurred. Please try later');
    expect(result.current.currentStep).toBe(1);
    expect(result.current.loading).toBe(false);
  });
});
