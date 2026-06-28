import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { InterviewDto } from '@client/api';
import { InterviewStatus } from '@client/domain/interview';
import type { MentorInterview } from '@client/services/course';
import { InterviewsSummary } from './InterviewsSummary';

const { updateStageInterview } = vi.hoisted(() => ({ updateStageInterview: vi.fn() }));

vi.mock('@client/services/course', async importOriginal => {
  const actual = await importOriginal<typeof import('@client/services/course')>();
  return {
    ...actual,
    CourseService: class {
      updateStageInterview = updateStageInterview;
    },
  };
});

// Stub the transfer modal so the summary's transfer flow can be exercised
// without dragging in MentorSearch/antd Form internals.
vi.mock('./SelectMentorModal', () => ({
  SelectMentorModal: ({
    onOk,
    onCancel,
    interviews,
  }: {
    onOk: (githubId: string, interviewId: number) => void;
    onCancel: () => void;
    interviews: MentorInterview[];
  }) => (
    <div role="dialog" aria-label="select-mentor">
      <span>transfer candidates: {interviews.length}</span>
      <button onClick={() => onOk('new-mentor', interviews[0].id)}>confirm-transfer</button>
      <button onClick={onCancel}>close-transfer</button>
    </div>
  ),
}));

function makeInterview(overrides: Partial<MentorInterview> = {}): MentorInterview {
  return {
    id: 1,
    name: 'Technical Screening',
    endDate: '2025-01-01',
    completed: false,
    interviewer: null,
    status: InterviewStatus.NotCompleted,
    student: { id: 1, githubId: 'student-1', name: 'Student One' } as MentorInterview['student'],
    ...overrides,
  };
}

const INTERVIEW_TASK = {
  id: 99,
  name: 'Technical Screening',
} as InterviewDto;

function renderSummary(props: Partial<Parameters<typeof InterviewsSummary>[0]> = {}) {
  const toggleDetails = vi.fn();
  const reloadList = vi.fn().mockResolvedValue(undefined);
  render(
    <InterviewsSummary
      interviewTask={INTERVIEW_TASK}
      interviews={[makeInterview({ id: 1, completed: true }), makeInterview({ id: 2, completed: false })]}
      toggleDetails={toggleDetails}
      courseId={400}
      courseAlias="rs-2025"
      reloadList={reloadList}
      {...props}
    />,
  );
  return { toggleDetails, reloadList };
}

describe('InterviewsSummary', () => {
  beforeEach(() => updateStageInterview.mockReset().mockResolvedValue({}));

  it('should render the completed/total count', () => {
    renderSummary();

    expect(screen.getByText(/Interviewed students 1\(2\)/)).toBeInTheDocument();
  });

  it('should toggle details when "Show details" is clicked', async () => {
    const user = userEvent.setup();
    const { toggleDetails } = renderSummary();

    await user.click(screen.getByRole('button', { name: 'Show details' }));

    expect(toggleDetails).toHaveBeenCalled();
  });

  it('should link "Add student" to the wait list', () => {
    renderSummary();

    expect(screen.getByRole('link', { name: /Add student/ })).toHaveAttribute(
      'href',
      '/course/mentor/interview-wait-list?course=rs-2025&interviewId=99',
    );
  });

  it('should show "Transfer student" only for a technical screening with uncompleted interviews', () => {
    renderSummary();

    expect(screen.getByRole('button', { name: /Transfer student/ })).toBeInTheDocument();
  });

  it('should not show "Transfer student" for a non-screening interview', () => {
    renderSummary({ interviewTask: { ...INTERVIEW_TASK, name: 'CoreJS Interview' } as InterviewDto });

    expect(screen.queryByRole('button', { name: /Transfer student/ })).not.toBeInTheDocument();
  });

  it('should not show "Transfer student" when every interview is completed', () => {
    renderSummary({
      interviews: [makeInterview({ id: 1, completed: true }), makeInterview({ id: 2, completed: true })],
    });

    expect(screen.queryByRole('button', { name: /Transfer student/ })).not.toBeInTheDocument();
  });

  it('should open the transfer modal with only the uncompleted interviews', async () => {
    const user = userEvent.setup();
    renderSummary();

    await user.click(screen.getByRole('button', { name: /Transfer student/ }));

    expect(screen.getByRole('dialog', { name: 'select-mentor' })).toBeInTheDocument();
    // only id:2 is uncompleted
    expect(screen.getByText('transfer candidates: 1')).toBeInTheDocument();
  });

  it('should close the transfer modal on cancel', async () => {
    const user = userEvent.setup();
    renderSummary();

    await user.click(screen.getByRole('button', { name: /Transfer student/ }));
    await user.click(screen.getByRole('button', { name: 'close-transfer' }));

    expect(screen.queryByRole('dialog', { name: 'select-mentor' })).not.toBeInTheDocument();
  });

  it('should transfer the interview, reload the list and close the modal on confirm', async () => {
    const user = userEvent.setup();
    const { reloadList } = renderSummary();

    await user.click(screen.getByRole('button', { name: /Transfer student/ }));
    await user.click(screen.getByRole('button', { name: 'confirm-transfer' }));

    await waitFor(() => expect(updateStageInterview).toHaveBeenCalledWith(2, { githubId: 'new-mentor' }));
    expect(reloadList).toHaveBeenCalled();
    await waitFor(() => expect(screen.queryByRole('dialog', { name: 'select-mentor' })).not.toBeInTheDocument());
  });
});
