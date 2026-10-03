import { act, fireEvent, render, screen } from '@testing-library/react';
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

  it('handles eligibility, mentoring options, dismissal, and stored dismissal', () => {
    window.sessionStorage.clear();
    const showMentorOptions = vi.fn();
    const { rerender, unmount } = render(
      <MentorOptionsContext.Provider value={{ showMentorOptions }}>
        <RegistrationNoticeAlert interview={interview} startDate="2023-02-01" />
      </MentorOptionsContext.Provider>,
    );

    expect(screen.queryByText('test course')).not.toBeInTheDocument();

    rerender(
      <MentorOptionsContext.Provider value={{ showMentorOptions }}>
        <RegistrationNoticeAlert interview={{ ...interview, type: 'interview' }} startDate="2023-02-01" />
      </MentorOptionsContext.Provider>,
    );

    expect(screen.queryByText('test course')).not.toBeInTheDocument();

    rerender(
      <MentorOptionsContext.Provider value={{ showMentorOptions }}>
        <RegistrationNoticeAlert interview={interview} startDate="2023-01-02" />
      </MentorOptionsContext.Provider>,
    );

    expect(screen.getByText('test course', { exact: false })).toBeInTheDocument();
    fireEvent.click(screen.getByText('mentoring options'));

    expect(showMentorOptions).toHaveBeenCalled();

    // antd Alert renders a close button when `closable`.
    fireEvent.click(screen.getByRole('button', { name: /close/i }));
    act(() => vi.runOnlyPendingTimers());

    // After dismissal the alert text is gone (useAlert persisted via sessionStorage).
    expect(screen.queryByText('test course', { exact: false })).not.toBeInTheDocument();
    unmount();

    // Pre-set the sessionStorage flag useAlert reads so the `isDismissed` early-return runs.
    window.sessionStorage.setItem(`registration-notice-alert-${interview.id}`, 'true');

    render(<RegistrationNoticeAlert interview={interview} startDate="2023-01-02" />);

    expect(screen.queryByText('test course', { exact: false })).not.toBeInTheDocument();
    window.sessionStorage.clear();
  });
});
