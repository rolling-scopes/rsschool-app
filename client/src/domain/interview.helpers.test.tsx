import { render, screen } from '@testing-library/react';
import { StageInterviewFeedbackVerdict } from '@common/models';
import { Decision } from '@client/data/interviews/technical-screening';
import { initializeFeatures } from '@client/services/features';
import {
  friendlyStageInterviewVerdict,
  getInterviewResult,
  getInterviewCardResult,
  getInterviewFeedbackUrl,
  isTechnicalScreening,
  getInterviewWaitList,
  isRegistrationNotStarted,
  InterviewResult,
  InterviewStatus,
  DecisionTag,
  InterviewPeriod,
} from './interview';

describe('friendlyStageInterviewVerdict', () => {
  it.each`
    value                   | expected
    ${'didNotDecideYet'}    | ${'No decision yet'}
    ${'no'}                 | ${'No'}
    ${'yes'}                | ${'Yes'}
    ${'noButGoodCandidate'} | ${'No, but good student'}
    ${'unknown'}            | ${'unknown'}
  `('maps "$value" to "$expected"', ({ value, expected }) => {
    expect(friendlyStageInterviewVerdict(value as StageInterviewFeedbackVerdict)).toBe(expected);
  });
});

describe('getInterviewResult', () => {
  it.each`
    decision                        | expected
    ${Decision.Yes}                 | ${'Mentor accepted'}
    ${Decision.No}                  | ${'Mentor declined'}
    ${Decision.Draft}               | ${'No decision yet'}
    ${Decision.SeparateStudy}       | ${'Separate study'}
    ${Decision.MissedIgnoresMentor} | ${'Ignored mentor'}
    ${Decision.MissedWithReason}    | ${'Missed with a reason'}
  `('maps $decision to "$expected"', ({ decision, expected }) => {
    expect(getInterviewResult(decision)).toBe(expected);
  });

  it('falls back to the friendly stage verdict for unknown decisions', () => {
    expect(getInterviewResult('noButGoodCandidate' as Decision)).toBe('No, but good student');
  });
});

describe('getInterviewCardResult', () => {
  it.each`
    decision                        | expected
    ${Decision.Yes}                 | ${InterviewResult.Yes}
    ${Decision.Draft}               | ${InterviewResult.Draft}
    ${'didNotDecideYet'}            | ${InterviewResult.Draft}
    ${Decision.No}                  | ${InterviewResult.No}
    ${Decision.SeparateStudy}       | ${InterviewResult.No}
    ${Decision.MissedIgnoresMentor} | ${InterviewResult.No}
    ${Decision.MissedWithReason}    | ${InterviewResult.No}
    ${'noButGoodCandidate'}         | ${InterviewResult.No}
  `('maps $decision to $expected', ({ decision, expected }) => {
    expect(getInterviewCardResult(decision)).toBe(expected);
  });

  it('defaults to Yes for anything unrecognised', () => {
    expect(getInterviewCardResult('something-else' as Decision)).toBe(InterviewResult.Yes);
  });
});

describe('isTechnicalScreening', () => {
  it('detects the Technical Screening interview name', () => {
    expect(isTechnicalScreening('Stage Technical Screening')).toBe(true);
    expect(isTechnicalScreening('CoreJS Interview')).toBe(false);
  });
});

describe('getInterviewFeedbackUrl', () => {
  const base = {
    courseAlias: 'rs-2023',
    studentGithubId: 'gh',
    studentId: 99,
    interviewId: 5,
  };

  afterEach(() => initializeFeatures({}));

  it('returns the legacy technical-screening url when the feedback feature is off', () => {
    initializeFeatures({ feedback: 'off' });
    const url = getInterviewFeedbackUrl({ ...base, interviewName: 'Technical Screening', template: 'tpl' });
    expect(url).toBe('/course/mentor/interview-technical-screening?course=rs-2023&githubId=gh');
  });

  it('uses the stage-interview type for screenings when feedback is on', () => {
    initializeFeatures({ feedback: 'on' });
    const url = getInterviewFeedbackUrl({ ...base, interviewName: 'Technical Screening', template: 'tpl' });
    expect(url).toBe(
      '/course/interview/stage-interview/feedback?course=rs-2023&githubId=gh&studentId=99&interviewId=5',
    );
  });

  it('uses the provided template for non-screening interviews', () => {
    initializeFeatures({ feedback: 'on' });
    const url = getInterviewFeedbackUrl({ ...base, interviewName: 'CoreJS', template: 'corejs' });
    expect(url).toBe('/course/interview/corejs/feedback?course=rs-2023&githubId=gh&studentId=99&interviewId=5');
  });
});

describe('getInterviewWaitList', () => {
  it('builds the wait-list url', () => {
    expect(getInterviewWaitList('rs-2023', 7)).toBe('/course/mentor/interview-wait-list?course=rs-2023&interviewId=7');
  });
});

describe('isRegistrationNotStarted', () => {
  beforeAll(() => vi.useFakeTimers().setSystemTime(new Date('2023-06-15T00:00:00Z')));
  afterAll(() => vi.useRealTimers());

  it('returns true when the registration start date is in the future', () => {
    expect(isRegistrationNotStarted('2023-07-01')).toBe(true);
  });

  it('returns false when the registration start date is in the past', () => {
    expect(isRegistrationNotStarted('2023-01-01')).toBe(false);
  });

  it('returns false for an empty start date', () => {
    expect(isRegistrationNotStarted('')).toBe(false);
  });
});

describe('DecisionTag', () => {
  it('renders Completed (green) when no decision but status is Completed', () => {
    render(<DecisionTag status={InterviewStatus.Completed} />);
    expect(screen.getByText('Completed')).toBeInTheDocument();
  });

  it('renders Uncompleted when no decision and not completed', () => {
    render(<DecisionTag status={InterviewStatus.NotCompleted} />);
    expect(screen.getByText('Uncompleted')).toBeInTheDocument();
  });

  it.each`
    decision                        | label
    ${Decision.Yes}                 | ${'Completed'}
    ${Decision.No}                  | ${'Completed'}
    ${Decision.Draft}               | ${'Unfilled form'}
    ${Decision.SeparateStudy}       | ${'Separate study'}
    ${Decision.MissedIgnoresMentor} | ${'Ignored mentor'}
    ${Decision.MissedWithReason}    | ${'Missed with a reason'}
  `('renders "$label" for $decision', ({ decision, label }) => {
    render(<DecisionTag decision={decision} />);
    expect(screen.getByText(label)).toBeInTheDocument();
  });

  it('renders Completed for the legacy noButGoodCandidate value', () => {
    render(<DecisionTag decision={'noButGoodCandidate' as Decision} />);
    expect(screen.getByText('Completed')).toBeInTheDocument();
  });

  it('renders Unfilled form for the legacy didNotDecideYet value', () => {
    render(<DecisionTag decision={'didNotDecideYet' as Decision} />);
    expect(screen.getByText('Unfilled form')).toBeInTheDocument();
  });

  it('renders Uncompleted for an unknown legacy decision value', () => {
    render(<DecisionTag decision={'mystery' as Decision} />);
    expect(screen.getByText('Uncompleted')).toBeInTheDocument();
  });
});

describe('InterviewPeriod', () => {
  it('renders the full date range by default', () => {
    render(<InterviewPeriod startDate="2023-03-09T00:00:00Z" endDate="2023-03-20T00:00:00Z" />);
    expect(screen.getByText('2023-03-09 - 2023-03-20')).toBeInTheDocument();
  });

  it('renders the short date range when shortDate is set', () => {
    render(<InterviewPeriod startDate="2023-03-09T00:00:00Z" endDate="2023-03-20T00:00:00Z" shortDate />);
    expect(screen.getByText('Mar 09 - Mar 20')).toBeInTheDocument();
  });
});
