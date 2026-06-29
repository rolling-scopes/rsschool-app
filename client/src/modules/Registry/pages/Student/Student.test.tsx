import { render, screen } from '@testing-library/react';
import { useRouter } from 'next/router';
// eslint-disable-next-line boundaries/element-types -- the page itself consumes SessionContext from this module; the test must provide it.
import { SessionContext } from '@client/modules/Course/contexts';
import type { Session } from '@client/components/withSession';
import { StudentRegistry } from './Student';

// Boundary mocks:
// - the data hook (real registration logic is unit-tested separately in useStudentData.test);
//   here we drive each render branch deterministically.
// - RegistrationForm + RegistrationPageLayout are heavy/brittle (steps, next/script, maps),
//   stubbed to a marker so we assert only the page's branch wiring.
// CourseCertificateAlert and NoCourses stay REAL so the conditional rendering is exercised.
const { mockedUseStudentData } = vi.hoisted(() => ({ mockedUseStudentData: vi.fn() }));

vi.mock('@client/modules/Registry/hooks', () => ({
  useStudentData: mockedUseStudentData,
}));

vi.mock('@client/components/RegistrationPageLayout', () => ({
  RegistrationPageLayout: ({ loading, children }: { loading: boolean; children: React.ReactNode }) => (
    <div data-testid="page-layout" data-loading={String(loading)}>
      {children}
    </div>
  ),
}));

vi.mock('@client/modules/Registry/components', async importOriginal => {
  const actual = await importOriginal<typeof import('@client/modules/Registry/components')>();
  return {
    ...actual,
    RegistrationForm: ({ type }: { type?: string }) => <div data-testid="registration-form">type:{type}</div>,
  };
});

const baseData = {
  courses: [],
  loading: false,
  registered: false,
  steps: [],
  currentStep: 0,
  form: {} as never,
  handleSubmit: vi.fn(),
  modalContext: <span data-testid="modal-context" />,
  missingDisciplines: '',
};

function setData(overrides: Partial<typeof baseData> = {}) {
  mockedUseStudentData.mockReturnValue({ ...baseData, ...overrides });
}

function renderPage(session: Partial<Session> = { githubId: 'octocat' }) {
  return render(
    <SessionContext.Provider value={session as Session}>
      <StudentRegistry />
    </SessionContext.Provider>,
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(useRouter).mockReturnValue({ query: {}, push: vi.fn() } as never);
  setData();
});

describe('StudentRegistry', () => {
  test('passes the session githubId and course query param to useStudentData', () => {
    vi.mocked(useRouter).mockReturnValue({ query: { course: 'js-2024' }, push: vi.fn() } as never);
    setData({ courses: [{ id: 1 } as never] });

    renderPage({ githubId: 'octocat' });

    expect(mockedUseStudentData).toHaveBeenCalledWith('octocat', 'js-2024');
  });

  test('renders nothing but the modal context while loading', () => {
    setData({ loading: true });

    renderPage();

    expect(screen.getByTestId('modal-context')).toBeInTheDocument();
    expect(screen.queryByTestId('registration-form')).not.toBeInTheDocument();
    expect(screen.queryByText('There are no available courses.')).not.toBeInTheDocument();
    expect(screen.getByTestId('page-layout')).toHaveAttribute('data-loading', 'true');
  });

  test('renders no content once registered (redirecting)', () => {
    setData({ registered: true });

    renderPage();

    expect(screen.queryByTestId('registration-form')).not.toBeInTheDocument();
    expect(screen.queryByText('There are no available courses.')).not.toBeInTheDocument();
  });

  test('shows the certificate alert when disciplines are missing and courses exist', () => {
    setData({ missingDisciplines: 'JavaScript', courses: [{ id: 1 } as never] });

    renderPage();

    expect(
      screen.getByText('To register for this course, you need to already have JavaScript RS School certificate.'),
    ).toBeInTheDocument();
    expect(screen.queryByTestId('registration-form')).not.toBeInTheDocument();
  });

  test('shows the empty state when there are no courses', () => {
    setData({ courses: [] });

    renderPage();

    expect(screen.getByText('There are no available courses.')).toBeInTheDocument();
    expect(screen.queryByTestId('registration-form')).not.toBeInTheDocument();
  });

  test('renders the student registration form when courses are available', () => {
    setData({ courses: [{ id: 1 } as never] });

    renderPage();

    const form = screen.getByTestId('registration-form');
    expect(form).toBeInTheDocument();
    expect(form).toHaveTextContent('type:student');
  });

  test('always renders the modal context regardless of branch', () => {
    setData({ courses: [{ id: 1 } as never] });

    renderPage();

    expect(screen.getByTestId('modal-context')).toBeInTheDocument();
  });
});
