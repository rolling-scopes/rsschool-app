import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DashboardDetails } from './DashboardDetails';
import type { StudentDetails } from '@client/services/course';

// MentorSearch is a remote-search Select; stub with a value emitter.
vi.mock('@client/shared/components/MentorSearch', () => ({
  MentorSearch: ({ onChange }: { onChange: (v: string) => void }) => (
    <button data-testid="pick-mentor" onClick={() => onChange('new-mentor')}>
      pick mentor
    </button>
  ),
}));

// CommentModal is a controlled antd Modal; stub to expose open state + onOk.
vi.mock('@client/shared/components/CommentModal', () => ({
  CommentModal: ({ open, onOk, onCancel }: { open: boolean; onOk: (t: string) => void; onCancel: () => void }) =>
    open ? (
      <div data-testid="comment-modal">
        <button onClick={() => onOk('expel reason')}>submit-comment</button>
        <button onClick={onCancel}>cancel-comment</button>
      </div>
    ) : null,
}));

// IssueCertificateModal pulls in a template picker; stub similarly.
vi.mock('@client/modules/CourseManagement/components', () => ({
  IssueCertificateModal: ({
    open,
    onSubmit,
    onCancel,
  }: {
    open: boolean;
    onSubmit: (id: string) => void;
    onCancel: () => void;
  }) =>
    open ? (
      <div data-testid="issue-modal">
        <button onClick={() => onSubmit('tpl-1')}>submit-cert</button>
        <button onClick={onCancel}>cancel-cert</button>
      </div>
    ) : null,
}));

const activeDetails: StudentDetails = {
  id: 1,
  githubId: 'student-1',
  name: 'Student One',
  isActive: true,
  countryName: 'PL',
  cityName: 'Warsaw',
  totalScore: 100,
  mentor: { id: 2, githubId: 'mentor-1', name: 'Mentor One' },
  discord: null,
  interviews: [],
} as StudentDetails;

function makeProps(overrides: Partial<React.ComponentProps<typeof DashboardDetails>> = {}) {
  return {
    details: activeDetails,
    courseId: 7,
    isLoading: false,
    isAdmin: false,
    onClose: vi.fn(),
    onRestoreStudent: vi.fn(),
    onExpelStudent: vi.fn(),
    onIssueCertificate: vi.fn().mockResolvedValue(true),
    onRemoveCertificate: vi.fn(),
    onUpdateMentor: vi.fn(),
    courseManagerOrSupervisor: false,
    ...overrides,
  };
}

describe('DashboardDetails', () => {
  it('renders nothing when details is null', () => {
    const { container } = render(<DashboardDetails {...makeProps({ details: null })} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('renders the drawer title with name and github id', () => {
    render(<DashboardDetails {...makeProps()} />);
    expect(screen.getByText('Student One , student-1')).toBeInTheDocument();
  });

  it('shows the Expel button for an active student and opens the comment modal', async () => {
    const user = userEvent.setup();
    const onExpelStudent = vi.fn();
    render(<DashboardDetails {...makeProps({ onExpelStudent })} />);

    await user.click(screen.getByRole('button', { name: /Expel/ }));
    expect(screen.getByTestId('comment-modal')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'submit-comment' }));
    expect(onExpelStudent).toHaveBeenCalledWith('expel reason');
  });

  it('shows the Restore button for an inactive student', async () => {
    const user = userEvent.setup();
    const onRestoreStudent = vi.fn();
    const inactive = { ...activeDetails, isActive: false } as StudentDetails;
    render(<DashboardDetails {...makeProps({ details: inactive, onRestoreStudent })} />);

    const restore = screen.getByRole('button', { name: /Restore/ });
    await user.click(restore);
    expect(onRestoreStudent).toHaveBeenCalled();
  });

  it('hides manager controls when not a manager/supervisor', () => {
    render(<DashboardDetails {...makeProps({ courseManagerOrSupervisor: false })} />);
    expect(screen.queryByRole('button', { name: /Issue Certificate/ })).not.toBeInTheDocument();
    expect(screen.queryByTestId('pick-mentor')).not.toBeInTheDocument();
  });

  it('shows manager controls and updates the mentor', async () => {
    const user = userEvent.setup();
    const onUpdateMentor = vi.fn();
    render(<DashboardDetails {...makeProps({ courseManagerOrSupervisor: true, onUpdateMentor })} />);

    expect(screen.getByRole('button', { name: /Issue Certificate/ })).toBeInTheDocument();
    await user.click(screen.getByTestId('pick-mentor'));
    expect(onUpdateMentor).toHaveBeenCalledWith('new-mentor');
  });

  it('renders the manager mentor control when the student has no mentor', () => {
    const noMentor = { ...activeDetails, mentor: null } as StudentDetails;
    render(<DashboardDetails {...makeProps({ details: noMentor, courseManagerOrSupervisor: true })} />);

    expect(screen.getByText('Mentor')).toBeInTheDocument();
    expect(screen.getByTestId('pick-mentor')).toBeInTheDocument();
  });

  it('issues a certificate and closes the modal on success', async () => {
    const user = userEvent.setup();
    const onIssueCertificate = vi.fn().mockResolvedValue(true);
    render(<DashboardDetails {...makeProps({ courseManagerOrSupervisor: true, onIssueCertificate })} />);

    await user.click(screen.getByRole('button', { name: /Issue Certificate/ }));
    expect(screen.getByTestId('issue-modal')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'submit-cert' }));
    await waitFor(() => expect(onIssueCertificate).toHaveBeenCalledWith('tpl-1'));
    await waitFor(() => expect(screen.queryByTestId('issue-modal')).not.toBeInTheDocument());
  });

  it('keeps the issue modal open when issuing fails', async () => {
    const user = userEvent.setup();
    const onIssueCertificate = vi.fn().mockResolvedValue(false);
    render(<DashboardDetails {...makeProps({ courseManagerOrSupervisor: true, onIssueCertificate })} />);

    await user.click(screen.getByRole('button', { name: /Issue Certificate/ }));
    await user.click(screen.getByRole('button', { name: 'submit-cert' }));

    await waitFor(() => expect(onIssueCertificate).toHaveBeenCalled());
    expect(screen.getByTestId('issue-modal')).toBeInTheDocument();
  });

  it('closes the comment modal on cancel without expelling', async () => {
    const user = userEvent.setup();
    const onExpelStudent = vi.fn();
    render(<DashboardDetails {...makeProps({ onExpelStudent })} />);

    await user.click(screen.getByRole('button', { name: /Expel/ }));
    expect(screen.getByTestId('comment-modal')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'cancel-comment' }));
    await waitFor(() => expect(screen.queryByTestId('comment-modal')).not.toBeInTheDocument());
    expect(onExpelStudent).not.toHaveBeenCalled();
  });

  it('closes the issue-certificate modal on cancel', async () => {
    const user = userEvent.setup();
    const onIssueCertificate = vi.fn();
    render(<DashboardDetails {...makeProps({ courseManagerOrSupervisor: true, onIssueCertificate })} />);

    await user.click(screen.getByRole('button', { name: /Issue Certificate/ }));
    expect(screen.getByTestId('issue-modal')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'cancel-cert' }));
    await waitFor(() => expect(screen.queryByTestId('issue-modal')).not.toBeInTheDocument());
    expect(onIssueCertificate).not.toHaveBeenCalled();
  });

  it('shows the Remove Certificate confirm for admins and fires onRemoveCertificate', async () => {
    const user = userEvent.setup();
    const onRemoveCertificate = vi.fn();
    render(
      <DashboardDetails {...makeProps({ isAdmin: true, courseManagerOrSupervisor: true, onRemoveCertificate })} />,
    );

    await user.click(screen.getByRole('button', { name: /Remove Certificate/ }));
    // Popconfirm yes button
    await user.click(await screen.findByRole('button', { name: /yes|ok/i }));
    await waitFor(() => expect(onRemoveCertificate).toHaveBeenCalled());
  });
});
