import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { InterviewDto } from '@client/api';
import { InterviewDetails, InterviewStatus } from '@client/domain/interview';
import { Decision } from '@client/data/interviews/technical-screening';
import { InterviewCard } from './InterviewCard';

// Real antd + real domain helpers are used; the only collaborator that reaches
// outside is GithubUserLink (it pulls @client/hooks, already aliased to a mock).
// No brittle widget here — register is a plain antd Button.

const FUTURE = '2999-01-01T00:00:00.000Z';
const PAST = '2000-01-01T00:00:00.000Z';

function makeInterview(overrides: Partial<InterviewDto> = {}): InterviewDto {
  return {
    id: 7,
    type: 'interview',
    name: 'JS Interview',
    startDate: '2024-05-01T00:00:00.000Z',
    endDate: '2024-05-10T00:00:00.000Z',
    description: 'desc',
    descriptionUrl: 'https://example.com/interview',
    attributes: {} as InterviewDto['attributes'],
    studentRegistrationStartDate: PAST,
    ...overrides,
  };
}

function makeItem(overrides: Partial<InterviewDetails> = {}): InterviewDetails {
  return {
    id: 100,
    name: 'JS Interview',
    completed: true,
    status: InterviewStatus.Completed,
    result: Decision.Yes,
    descriptionUrl: 'https://example.com/interview',
    startDate: '2024-05-01T00:00:00.000Z',
    endDate: '2024-05-10T00:00:00.000Z',
    interviewer: { name: 'Mentor One', githubId: 'mentor1' },
    student: { name: 'Student One', githubId: 'student1' },
    ...overrides,
  };
}

describe('<InterviewCard />', () => {
  beforeEach(() => vi.clearAllMocks());

  it('renders the interview name as an external link to its description', () => {
    render(<InterviewCard interview={makeInterview()} item={null} isRegistered={false} onRegister={vi.fn()} />);

    const link = screen.getByRole('link', { name: 'JS Interview' });
    expect(link).toHaveAttribute('href', 'https://example.com/interview');
    expect(link).toHaveAttribute('target', '_blank');
  });

  describe('not registered, registration open (no pair)', () => {
    it('shows an enabled Register button and prompts to register', () => {
      render(<InterviewCard interview={makeInterview()} item={null} isRegistered={false} onRegister={vi.fn()} />);

      const register = screen.getByRole('button', { name: /^register$/i });
      expect(register).toBeEnabled();
      expect(screen.getByText(/register and get ready for your exciting interview/i)).toBeInTheDocument();
    });

    it('calls onRegister with the interview id (as string) on click', () => {
      const onRegister = vi.fn();
      render(
        <InterviewCard interview={makeInterview({ id: 7 })} item={null} isRegistered={false} onRegister={onRegister} />,
      );

      fireEvent.click(screen.getByRole('button', { name: /^register$/i }));

      expect(onRegister).toHaveBeenCalledTimes(1);
      expect(onRegister).toHaveBeenCalledWith('7');
    });
  });

  describe('registered, no pair yet', () => {
    it('shows a disabled "Registered" button and the "all set" message', () => {
      const onRegister = vi.fn();
      render(<InterviewCard interview={makeInterview()} item={null} isRegistered={true} onRegister={onRegister} />);

      const registered = screen.getByRole('button', { name: /registered/i });
      expect(registered).toBeDisabled();

      fireEvent.click(registered);
      expect(onRegister).not.toHaveBeenCalled();

      expect(screen.getByText(/you’re all set! prepare for your upcoming interview/i)).toBeInTheDocument();
    });
  });

  describe('registration not started', () => {
    it('shows a "Registration starts on" tag instead of a button and a come-back-later message', () => {
      render(
        <InterviewCard
          interview={makeInterview({ studentRegistrationStartDate: FUTURE })}
          item={null}
          isRegistered={false}
          onRegister={vi.fn()}
        />,
      );

      expect(screen.queryByRole('button', { name: /^register$/i })).not.toBeInTheDocument();
      expect(screen.getByText(/registration starts on/i)).toBeInTheDocument();
      expect(screen.getByText(/remember to come back and register after/i)).toBeInTheDocument();
    });
  });

  describe('has an interview pair (item present)', () => {
    it('renders the interview details (interviewer, status, result) instead of the Register control', () => {
      render(
        <InterviewCard
          interview={makeInterview()}
          item={makeItem({ status: InterviewStatus.Completed, result: Decision.Yes })}
          isRegistered={true}
          onRegister={vi.fn()}
        />,
      );

      // No register/registered button when a pair exists.
      expect(screen.queryByRole('button', { name: /^register(ed)?$/i })).not.toBeInTheDocument();

      // Details section.
      expect(screen.getByText('Interviewer')).toBeInTheDocument();
      expect(screen.getByText('Status')).toBeInTheDocument();
      expect(screen.getByText('Result')).toBeInTheDocument();
      // Completed status label + accepted result.
      expect(screen.getByText('Completed')).toBeInTheDocument();
      expect(screen.getByText('Mentor accepted')).toBeInTheDocument();
    });

    it('shows the congratulations message when the interview passed with a "yes" result', () => {
      render(
        <InterviewCard
          interview={makeInterview()}
          item={makeItem({ status: InterviewStatus.Completed, result: Decision.Yes })}
          isRegistered={true}
          onRegister={vi.fn()}
        />,
      );

      expect(screen.getByText(/you have your interview result\. congratulations/i)).toBeInTheDocument();
    });

    it('shows the encouraging message when the interview passed with a "no" result', () => {
      render(
        <InterviewCard
          interview={makeInterview()}
          item={makeItem({ status: InterviewStatus.Completed, result: Decision.No })}
          isRegistered={true}
          onRegister={vi.fn()}
        />,
      );

      expect(screen.getByText(/mistakes are proof that you are trying/i)).toBeInTheDocument();
      expect(screen.getByText('Mentor declined')).toBeInTheDocument();
    });

    it('shows the "check back later" message when the result is still a draft', () => {
      render(
        <InterviewCard
          interview={makeInterview()}
          item={makeItem({ status: InterviewStatus.Completed, result: Decision.Draft })}
          isRegistered={true}
          onRegister={vi.fn()}
        />,
      );

      expect(screen.getByText(/the mentor hasn't provided feedback yet/i)).toBeInTheDocument();
    });

    it('renders a "Canceled" status label when the interview pair was canceled', () => {
      render(
        <InterviewCard
          interview={makeInterview()}
          item={makeItem({ status: InterviewStatus.Canceled, result: null })}
          isRegistered={true}
          onRegister={vi.fn()}
        />,
      );

      expect(screen.getByText('Canceled')).toBeInTheDocument();
    });

    it('shows the "contact your interviewer" message when registered with a pair but not yet completed', () => {
      render(
        <InterviewCard
          interview={makeInterview()}
          item={makeItem({ status: InterviewStatus.NotCompleted, result: null })}
          isRegistered={true}
          onRegister={vi.fn()}
        />,
      );

      expect(screen.getByText(/contact your interviewer to schedule the interview/i)).toBeInTheDocument();
      expect(screen.getByText('Not Completed')).toBeInTheDocument();
    });
  });

  it('renders the comment alert only when a comment is provided', () => {
    const { rerender } = render(
      <InterviewCard interview={makeInterview()} item={null} isRegistered={false} onRegister={vi.fn()} />,
    );
    expect(screen.queryByText('Nice progress!')).not.toBeInTheDocument();

    rerender(
      <InterviewCard
        interview={makeInterview()}
        item={null}
        isRegistered={false}
        onRegister={vi.fn()}
        comment="Nice progress!"
      />,
    );
    expect(screen.getByText('Nice progress!')).toBeInTheDocument();
  });
});
