import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { InterviewDto } from '@client/api';
import { RegistrationNoticeAlert } from './RegistrationNoticeAlert';
import { MentorOptionsContext } from './MentorPreferencesModal';

describe('RegistrationNoticeAlert', () => {
  beforeAll(() => vi.useFakeTimers().setSystemTime(new Date('2023-01-01')));

  afterAll(() => vi.useRealTimers());

  const interview: InterviewDto = {
    id: 1,
    startDate: '',
    endDate: '',
    description: '',
    name: 'test course',
    type: 'stage-interview',
    descriptionUrl: '',
    attributes: {},
    studentRegistrationStartDate: new Date('2023-01-01').toISOString(),
  };

  it('should not render component if registration not yet started', () => {
    render(<RegistrationNoticeAlert interview={interview} startDate="2023-02-01" />);

    expect(screen.queryByText('test course')).not.toBeInTheDocument();
  });

  it('should not render component if interview is not of stage type', () => {
    render(<RegistrationNoticeAlert interview={{ ...interview, type: 'interview' }} startDate="2023-02-01" />);

    expect(screen.queryByText('test course')).not.toBeInTheDocument();
  });

  it('should render component if registration in progress', () => {
    render(<RegistrationNoticeAlert interview={interview} startDate="2023-01-02" />);

    expect(screen.getByText('test course', { exact: false })).toBeInTheDocument();
  });

  it('opens mentoring options when the inline link is clicked', async () => {
    vi.useRealTimers();
    const showMentorOptions = vi.fn();
    const user = userEvent.setup();

    render(
      <MentorOptionsContext.Provider value={{ showMentorOptions }}>
        <RegistrationNoticeAlert interview={interview} startDate="2023-01-02" />
      </MentorOptionsContext.Provider>,
    );

    await user.click(screen.getByText('mentoring options'));

    expect(showMentorOptions).toHaveBeenCalled();
    vi.useFakeTimers().setSystemTime(new Date('2023-01-01'));
  });

  it('dismisses the alert when the close button is clicked', async () => {
    vi.useRealTimers();
    const user = userEvent.setup();

    render(<RegistrationNoticeAlert interview={interview} startDate="2023-01-02" />);

    // antd Alert renders a close button when `closable`.
    await user.click(screen.getByRole('button', { name: /close/i }));

    // After dismissal the alert text is gone (useAlert persisted via sessionStorage).
    expect(screen.queryByText('test course', { exact: false })).not.toBeInTheDocument();
    vi.useFakeTimers().setSystemTime(new Date('2023-01-01'));
  });

  it('does not render once it has been dismissed (persisted in sessionStorage)', () => {
    // Pre-set the sessionStorage flag useAlert reads so the `isDismissed` early-return runs.
    window.sessionStorage.setItem(`registration-notice-alert-${interview.id}`, 'true');

    render(<RegistrationNoticeAlert interview={interview} startDate="2023-01-02" />);

    expect(screen.queryByText('test course', { exact: false })).not.toBeInTheDocument();
    window.sessionStorage.clear();
  });
});
