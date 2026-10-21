import { render, screen } from '@testing-library/react';
import { useRouter } from 'next/router';
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

function Page({ session = { githubId: 'octocat', id: 1 } }: { session?: Partial<Session> }) {
  return (
    <SessionContext.Provider value={session as Session}>
      <StudentRegistry />
    </SessionContext.Provider>
  );
}

function renderPage(session?: Partial<Session>) {
  return render(<Page session={session} />);
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(useRouter).mockReturnValue({ query: {}, push: vi.fn() } as never);
  setData();
});

describe('StudentRegistry', () => {
  test('passes inputs and renders every loading and registration branch', () => {
    vi.mocked(useRouter).mockReturnValue({ query: { course: 'js-2024' }, push: vi.fn() } as never);
    setData({ courses: [{ id: 1 } as never] });

    const { rerender } = renderPage({ githubId: 'octocat', id: 1 });

    expect(mockedUseStudentData).toHaveBeenCalledWith('octocat', 1, 'js-2024');
    expect(screen.getByTestId('registration-form')).toHaveTextContent('type:student');
    expect(screen.getByTestId('modal-context')).toBeInTheDocument();

    setData({ loading: true });
    rerender(<Page />);

    expect(screen.getByTestId('modal-context')).toBeInTheDocument();
    expect(screen.queryByTestId('registration-form')).not.toBeInTheDocument();
    expect(screen.queryByText('There are no available courses.')).not.toBeInTheDocument();
    expect(screen.getByTestId('page-layout')).toHaveAttribute('data-loading', 'true');

    setData({ registered: true });
    rerender(<Page />);

    expect(screen.queryByTestId('registration-form')).not.toBeInTheDocument();
    expect(screen.queryByText('There are no available courses.')).not.toBeInTheDocument();

    setData({ missingDisciplines: 'JavaScript', courses: [{ id: 1 } as never] });
    rerender(<Page />);

    expect(
      screen.getByText('To register for this course, you need to already have JavaScript RS School certificate.'),
    ).toBeInTheDocument();
    expect(screen.queryByTestId('registration-form')).not.toBeInTheDocument();

    setData({ courses: [] });
    rerender(<Page />);

    expect(screen.getByText('There are no available courses.')).toBeInTheDocument();
    expect(screen.queryByTestId('registration-form')).not.toBeInTheDocument();

    setData({ courses: [{ id: 1 } as never] });
    rerender(<Page />);

    const form = screen.getByTestId('registration-form');
    expect(form).toBeInTheDocument();
    expect(form).toHaveTextContent('type:student');
    expect(screen.getByTestId('modal-context')).toBeInTheDocument();
  });
});
