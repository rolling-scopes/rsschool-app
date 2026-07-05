import { ReactNode } from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRouter } from 'next/router';
import { useStudentData } from './useStudentData';

// Boundary mocks: the hook fans out to UserService (profile + full profile info),
// CdnService (courses + student registration) and DisciplinesApi (certificate gating),
// then submits through ProfileApi + CdnService. We mock those service classes so the
// real eligibility/registration/modal logic runs against deterministic fixtures.
const { getMyProfile, getProfileInfo, getCourses, registerStudent, getDisciplinesByIds, updateUser, messageError } =
  vi.hoisted(() => ({
    getMyProfile: vi.fn(),
    getProfileInfo: vi.fn(),
    getCourses: vi.fn(),
    registerStudent: vi.fn(),
    getDisciplinesByIds: vi.fn(),
    updateUser: vi.fn(),
    messageError: vi.fn(),
  }));

// Stable message mock so the error assertion sees the exact spy the hook called
// (the shared `@client/hooks` mock returns a fresh object per call).
vi.mock('@client/hooks', () => ({
  useMessage: () => ({
    message: { success: vi.fn(), error: messageError, info: vi.fn(), warning: vi.fn() },
  }),
}));

vi.mock('@client/services/user', () => ({
  UserService: class {
    getMyProfile = getMyProfile;
    getProfileInfo = getProfileInfo;
  },
}));

vi.mock('@client/services/cdn', () => ({
  CdnService: class {
    getCourses = getCourses;
    registerStudent = registerStudent;
  },
}));

vi.mock('@client/api', async importOriginal => {
  const actual = await importOriginal<typeof import('@client/api')>();
  return {
    ...actual,
    DisciplinesApi: class {
      getDisciplinesByIds = getDisciplinesByIds;
    },
    ProfileApi: class {
      updateUser = updateUser;
    },
  };
});

const profile = {
  countryName: 'Belarus',
  cityName: 'Minsk',
  languages: ['English'],
  firstName: 'Ada',
  lastName: 'Lovelace',
  primaryEmail: 'ada@example.com',
  contactsEpamEmail: 'ada@epam.com',
};

// Open course used as the registration target (future registrationEndDate, no certificate gate).
const openCourse = {
  id: 1,
  alias: 'js-2024',
  name: 'JS 2024',
  fullName: 'JavaScript 2024',
  startDate: '2024-03-01',
  completed: false,
  planned: false,
  inviteOnly: false,
  registrationEndDate: '2999-01-01',
  certificateDisciplines: undefined,
  discipline: { id: 10, name: 'JavaScript' },
};

// A course the student is already enrolled in (drives the "registered for other courses" warning).
const enrolledCourse = {
  id: 2,
  alias: 'react-2024',
  name: 'React 2024',
  fullName: 'React 2024',
  startDate: '2024-02-01',
  completed: false,
  planned: false,
  inviteOnly: false,
  registrationEndDate: '2999-01-01',
  certificateDisciplines: undefined,
  discipline: { id: 11, name: 'React' },
};

// Exposes the hook's return value to assertions while still mounting modalContext,
// so Modal.useModal's confirm dialog can actually render and be clicked.
type Api = ReturnType<typeof useStudentData>;
function Harness({ courseAlias, onReady }: { courseAlias?: string; onReady: (api: Api) => void }) {
  const api = useStudentData('octocat', courseAlias);
  onReady(api);
  return (<>{api.modalContext}</>) as ReactNode;
}

function renderHookView(courseAlias?: string) {
  let latest: Api | undefined;
  render(<Harness courseAlias={courseAlias} onReady={api => (latest = api)} />);
  return {
    get current() {
      return latest as Api;
    },
  };
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(useRouter).mockReturnValue({ query: {}, push: vi.fn() } as never);
  getMyProfile.mockResolvedValue(profile);
  getProfileInfo.mockResolvedValue({ studentStats: [] });
  getCourses.mockResolvedValue([openCourse]);
  getDisciplinesByIds.mockResolvedValue({ data: [] });
  updateUser.mockResolvedValue({});
  registerStudent.mockResolvedValue({});
});

describe('useStudentData', () => {
  test('loads eligible courses and clears the loading flag', async () => {
    const view = renderHookView();

    await waitFor(() => expect(view.current.loading).toBe(false));
    expect(view.current.courses).toHaveLength(1);
    expect(view.current.courses[0]?.id).toBe(1);
    expect(view.current.registered).toBe(false);
  });

  test('builds the General/Done steps', async () => {
    const view = renderHookView();

    await waitFor(() => expect(view.current.loading).toBe(false));
    expect(view.current.steps.map(s => s.title)).toEqual(['General', 'Done']);
  });

  test('filters out invite-only courses', async () => {
    getCourses.mockResolvedValue([openCourse, { ...openCourse, id: 3, alias: 'x', inviteOnly: true }]);
    const view = renderHookView();

    await waitFor(() => expect(view.current.loading).toBe(false));
    expect(view.current.courses.map(c => c.id)).toEqual([1]);
  });

  test('marks the student as registered when already enrolled in the aliased course', async () => {
    getCourses.mockResolvedValue([enrolledCourse]);
    getProfileInfo.mockResolvedValue({
      studentStats: [{ courseId: 2, isExpelled: false, isCourseCompleted: false, certificateId: null }],
    });
    const view = renderHookView('react-2024');

    await waitFor(() => expect(view.current.registered).toBe(true));
  });

  test('reports missing certificate disciplines for a gated course', async () => {
    getCourses.mockResolvedValue([{ ...openCourse, certificateDisciplines: [10] }]);
    getProfileInfo.mockResolvedValue({ studentStats: [] });
    getDisciplinesByIds.mockResolvedValue({ data: [{ id: 10, name: 'JavaScript' }] });
    const view = renderHookView('js-2024');

    await waitFor(() => expect(view.current.missingDisciplines).toBe('JavaScript'));
  });

  test('submits user update and student registration when not enrolled elsewhere', async () => {
    const view = renderHookView();
    await waitFor(() => expect(view.current.loading).toBe(false));

    await act(async () => {
      await view.current.handleSubmit({
        courseId: 1,
        location: { countryName: 'Poland', cityName: 'Warsaw' },
        primaryEmail: 'a@b.c',
        contactsEpamEmail: 'a@epam.com',
        firstName: 'Ada',
        lastName: 'L',
        languagesMentoring: ['English'],
      } as never);
    });

    expect(updateUser).toHaveBeenCalledWith({
      cityName: 'Warsaw',
      countryName: 'Poland',
      primaryEmail: 'a@b.c',
      contactsEpamEmail: 'a@epam.com',
      firstName: 'Ada',
      lastName: 'L',
      languages: ['English'],
    });
    expect(registerStudent).toHaveBeenCalledWith({ type: 'student', courseId: 1 });
    await waitFor(() => expect(view.current.currentStep).toBe(1));
  });

  test('warns about existing enrollments and registers only after confirming', async () => {
    const user = userEvent.setup();
    getCourses.mockResolvedValue([openCourse, enrolledCourse]);
    getProfileInfo.mockResolvedValue({
      studentStats: [{ courseId: 2, isExpelled: false, isCourseCompleted: false, certificateId: null }],
    });
    const view = renderHookView();
    await waitFor(() => expect(view.current.loading).toBe(false));

    await act(async () => {
      await view.current.handleSubmit({
        courseId: 1,
        location: { countryName: 'Poland', cityName: 'Warsaw' },
        primaryEmail: 'a@b.c',
        contactsEpamEmail: 'a@epam.com',
        firstName: 'Ada',
        lastName: 'L',
        languagesMentoring: ['English'],
      } as never);
    });

    // A confirmation dialog warns about the already-registered course.
    expect(await screen.findByText('You are already registered for the following courses:')).toBeInTheDocument();
    expect(screen.getByText('React 2024 (Active)')).toBeInTheDocument();
    expect(registerStudent).not.toHaveBeenCalled();

    await user.click(screen.getByRole('button', { name: /Register/i }));

    await waitFor(() => expect(registerStudent).toHaveBeenCalledWith({ type: 'student', courseId: 1 }));
    expect(updateUser).toHaveBeenCalled();
  });

  test('surfaces an error message when registration fails', async () => {
    registerStudent.mockRejectedValueOnce(new Error('boom'));
    const view = renderHookView();
    await waitFor(() => expect(view.current.loading).toBe(false));

    await act(async () => {
      await view.current.handleSubmit({
        courseId: 1,
        location: { countryName: 'Poland', cityName: 'Warsaw' },
        primaryEmail: 'a@b.c',
        contactsEpamEmail: 'a@epam.com',
        firstName: 'Ada',
        lastName: 'L',
        languagesMentoring: ['English'],
      } as never);
    });

    await waitFor(() => expect(messageError).toHaveBeenCalledWith('An error occurred. Please try later'));
    expect(view.current.currentStep).toBe(0);
  });

  test('redirects to home five seconds after detecting an existing registration', async () => {
    vi.useFakeTimers();
    const push = vi.fn();
    vi.mocked(useRouter).mockReturnValue({ query: {}, push } as never);
    getCourses.mockResolvedValue([enrolledCourse]);
    getProfileInfo.mockResolvedValue({
      studentStats: [{ courseId: 2, isExpelled: false, isCourseCompleted: false, certificateId: null }],
    });
    const view = renderHookView('react-2024');

    await vi.waitFor(() => expect(view.current.registered).toBe(true));
    expect(push).not.toHaveBeenCalled();

    await act(async () => {
      vi.advanceTimersByTime(5000);
    });

    expect(push).toHaveBeenCalledWith('/');
    vi.useRealTimers();
  });

  test('without an alias, keeps only courses the student can fully unlock', async () => {
    // A second course requires a certificate the student lacks => excluded from the list.
    const gated = { ...openCourse, id: 5, alias: 'gated', certificateDisciplines: [10] };
    getCourses.mockResolvedValue([openCourse, gated]);
    getProfileInfo.mockResolvedValue({ studentStats: [] });
    getDisciplinesByIds.mockResolvedValue({ data: [{ id: 10, name: 'JavaScript' }] });
    const view = renderHookView();

    await waitFor(() => expect(view.current.loading).toBe(false));

    // Only the ungated open course survives the missing-discipline filter.
    expect(view.current.courses.map(c => c.id)).toEqual([1]);
  });

  test('ignores a submit fired before the async data has loaded', async () => {
    // Keep the data request pending so dataLoading stays true → handleSubmit early-returns.
    let resolveCourses: (v: unknown) => void = () => {};
    getCourses.mockReturnValue(new Promise(resolve => (resolveCourses = resolve)));
    const view = renderHookView();

    await act(async () => {
      await view.current.handleSubmit({ courseId: 1 } as never);
    });
    expect(registerStudent).not.toHaveBeenCalled();
    expect(updateUser).not.toHaveBeenCalled();

    // Let the pending request settle so the test exits cleanly.
    await act(async () => {
      resolveCourses([openCourse]);
    });
  });

  test('submits empty location strings when no location is provided', async () => {
    const view = renderHookView();
    await waitFor(() => expect(view.current.loading).toBe(false));

    await act(async () => {
      await view.current.handleSubmit({
        courseId: 1,
        // location omitted → `location?.cityName ?? ''` / `countryName ?? ''` fall back to ''.
        primaryEmail: 'a@b.c',
        contactsEpamEmail: 'a@epam.com',
        firstName: 'Ada',
        lastName: 'L',
        languagesMentoring: ['English'],
      } as never);
    });

    expect(updateUser).toHaveBeenCalledWith(expect.objectContaining({ cityName: '', countryName: '' }));
  });

  test('leaves the location null when the profile has no country/city', async () => {
    // getInitialValues: `countryName && cityName ? {…} : null` → null branch.
    getMyProfile.mockResolvedValue({ ...profile, countryName: undefined, cityName: undefined });
    const view = renderHookView();

    await waitFor(() => expect(view.current.loading).toBe(false));
    // The General step receives a null location (no crash, courses still resolved).
    expect(view.current.courses).toHaveLength(1);
  });

  test('handles a missing studentStats array when computing enrolled courses', async () => {
    // profileInfo without studentStats → `studentStats?.reduce(...) ?? []` and the `|| []`
    // fallback in getMissingDisciplines both engage.
    getProfileInfo.mockResolvedValue({});
    getCourses.mockResolvedValue([{ ...openCourse, certificateDisciplines: [10] }]);
    getDisciplinesByIds.mockResolvedValue({ data: [{ id: 10, name: 'JavaScript' }] });
    const view = renderHookView('js-2024');

    await waitFor(() => expect(view.current.loading).toBe(false));
    expect(view.current.registered).toBe(false);
  });

  test('keeps a planned course with no registration end date and labels it "Planned"', async () => {
    // registrationEndDate missing → `|| 0` (registration inactive), but planned → still open.
    // The student is already enrolled elsewhere so the warning lists it as "(Planned)".
    const plannedCourse = {
      ...openCourse,
      id: 7,
      alias: 'planned-course',
      planned: true,
      registrationEndDate: undefined,
    };
    const otherPlanned = {
      ...openCourse,
      id: 8,
      alias: 'other-planned',
      name: 'Other Planned',
      planned: true,
      completed: false,
      registrationEndDate: undefined,
    };
    getCourses.mockResolvedValue([plannedCourse, otherPlanned]);
    getProfileInfo.mockResolvedValue({
      studentStats: [{ courseId: 8, isExpelled: false, isCourseCompleted: false, certificateId: null }],
    });
    const view = renderHookView();
    await waitFor(() => expect(view.current.loading).toBe(false));

    // The planned course (id 7) is open for registration despite no active reg window.
    expect(view.current.courses.map(c => c.id)).toContain(7);

    await act(async () => {
      await view.current.handleSubmit({
        courseId: 7,
        location: { countryName: 'PL', cityName: 'WAW' },
        primaryEmail: 'a@b.c',
        contactsEpamEmail: 'a@epam.com',
        firstName: 'A',
        lastName: 'B',
        languagesMentoring: ['English'],
      } as never);
    });

    // The enrolled planned course is labelled with the "Planned" status.
    expect(await screen.findByText('Other Planned (Planned)')).toBeInTheDocument();
  });

  test('reports "any" missing discipline for an empty certificate list with no certificates', async () => {
    // certificateDisciplines = [] (empty array) and the student has no certificates →
    // `Array.isArray(disciplineIds) && !certifiedStudentCourseIds.length` → 'any'.
    getCourses.mockResolvedValue([{ ...openCourse, certificateDisciplines: [] }]);
    getProfileInfo.mockResolvedValue({ studentStats: [] });
    const view = renderHookView('js-2024');

    await waitFor(() => expect(view.current.missingDisciplines).toBe('any'));
  });
});
