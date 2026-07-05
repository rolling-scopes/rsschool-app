import { render, screen } from '@testing-library/react';
import { useRouter } from 'next/router';
import { MentorRegistry } from './Mentor';

// Boundary mocks: the data hook drives the branch (resume present -> form, absent -> null);
// RegistrationPageLayout and RegistrationForm are stubbed to markers (heavy/brittle).
const { mockedUseMentorData } = vi.hoisted(() => ({ mockedUseMentorData: vi.fn() }));

vi.mock('@client/modules/Registry/hooks', () => ({
  useMentorData: mockedUseMentorData,
}));

vi.mock('@client/components/RegistrationPageLayout', () => ({
  RegistrationPageLayout: ({ loading, children }: { loading: boolean; children: React.ReactNode }) => (
    <div data-testid="page-layout" data-loading={String(loading)}>
      {children}
    </div>
  ),
}));

vi.mock('@client/modules/Registry/components', () => ({
  RegistrationForm: ({ initialValues, type }: { initialValues?: unknown; type?: string }) => (
    <div data-testid="registration-form" data-type={type ?? 'default'}>
      {initialValues ? 'has-initial-values' : 'no-initial-values'}
    </div>
  ),
}));

const baseData = {
  resume: { firstName: 'Ada' },
  loading: false,
  currentStep: 0,
  steps: [],
  form: {} as never,
  handleSubmit: vi.fn(),
};

function setData(overrides: Partial<typeof baseData> = {}) {
  mockedUseMentorData.mockReturnValue({ ...baseData, ...overrides });
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(useRouter).mockReturnValue({ query: {}, push: vi.fn() } as never);
  setData();
});

describe('MentorRegistry', () => {
  test('forwards the course query param to useMentorData', () => {
    vi.mocked(useRouter).mockReturnValue({ query: { course: 'react-2024' }, push: vi.fn() } as never);

    render(<MentorRegistry />);

    expect(mockedUseMentorData).toHaveBeenCalledWith('react-2024');
  });

  test('renders the registration form with resume as initial values', () => {
    setData({ resume: { firstName: 'Ada' } });

    render(<MentorRegistry />);

    const form = screen.getByTestId('registration-form');
    expect(form).toBeInTheDocument();
    expect(form).toHaveTextContent('has-initial-values');
  });

  test('renders no form until the resume (initial values) is loaded', () => {
    setData({ resume: undefined });

    render(<MentorRegistry />);

    expect(screen.queryByTestId('registration-form')).not.toBeInTheDocument();
    expect(screen.getByTestId('page-layout')).toBeInTheDocument();
  });

  test('passes the loading flag down to the page layout', () => {
    setData({ loading: true, resume: undefined });

    render(<MentorRegistry />);

    expect(screen.getByTestId('page-layout')).toHaveAttribute('data-loading', 'true');
  });
});
