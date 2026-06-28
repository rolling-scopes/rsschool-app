import { render, screen } from '@testing-library/react';
import type { InterviewDto } from '@client/api';
import { TaskDtoTypeEnum } from '@client/api';
import type { Course } from '@client/services/models';
import { InterviewDetails } from './InterviewDetails';

// Stub the three children; we only assert which ones render for a given date.
vi.mock('./WaitListAlert', () => ({
  WaitListAlert: ({ startDate }: { startDate: string }) => <div>waitlist-alert {startDate}</div>,
}));
vi.mock('./RegistrationNoticeAlert', () => ({
  RegistrationNoticeAlert: ({ startDate }: { startDate: string }) => <div>registration-notice {startDate}</div>,
}));
vi.mock('./InterviewsList', () => ({
  InterviewsList: () => <div>interviews-list</div>,
}));

const COURSE = { id: 400, alias: 'rs-2025' } as Course;

function makeTask(startDate: string): InterviewDto {
  return {
    id: 99,
    name: 'CoreJS Interview',
    type: TaskDtoTypeEnum.Interview,
    startDate,
    endDate: '2030-01-01',
  } as unknown as InterviewDto;
}

function renderDetails(startDate: string) {
  render(
    <InterviewDetails
      interviewTask={makeTask(startDate)}
      course={COURSE}
      interviews={[]}
      fetchStudentInterviews={vi.fn()}
    />,
  );
}

describe('InterviewDetails', () => {
  beforeAll(() => vi.useFakeTimers().setSystemTime(new Date('2025-06-15')));
  afterAll(() => vi.useRealTimers());

  it('should render the wait-list alert and interviews list once the interview has started', () => {
    // start date in the past => interviewStarted = true
    renderDetails('2025-06-01');

    expect(screen.getByText(/waitlist-alert/)).toBeInTheDocument();
    expect(screen.getByText('interviews-list')).toBeInTheDocument();
    expect(screen.queryByText(/registration-notice/)).not.toBeInTheDocument();
  });

  it('should render the registration notice while registration is in progress', () => {
    // start date within the next 2 weeks => registration in progress, not started
    renderDetails('2025-06-20');

    expect(screen.getByText(/registration-notice/)).toBeInTheDocument();
    expect(screen.queryByText(/waitlist-alert/)).not.toBeInTheDocument();
    expect(screen.queryByText('interviews-list')).not.toBeInTheDocument();
  });

  it('should render nothing when the interview is far in the future', () => {
    // start date well beyond the 2-week registration window
    renderDetails('2025-09-01');

    expect(screen.queryByText(/waitlist-alert/)).not.toBeInTheDocument();
    expect(screen.queryByText(/registration-notice/)).not.toBeInTheDocument();
    expect(screen.queryByText('interviews-list')).not.toBeInTheDocument();
  });
});
