import { render, screen } from '@testing-library/react';
import { PrescreeningFeedback } from './PrescreeningFeedback';

type Steps = Record<string, { isCompleted?: boolean; values?: Record<string, unknown> }>;

function makeFeedback(steps: Steps) {
  return { feedback: { steps } as never };
}

describe('PrescreeningFeedback', () => {
  describe('when the interview is NOT rejected', () => {
    const steps: Steps = {
      decision: { values: { redFlags: 'none observed', comment: 'strong candidate' } },
      english: {
        values: {
          englishCertificate: 'IELTS 7.0',
          selfAssessment: 'B2 level',
          comment: 'learned at university',
        },
      },
      intro: { values: { interviewResult: 'completed', comment: 'should not show' } },
      theory: {
        values: {
          comment: 'good theory',
          questions: [
            { id: '1', topic: 'Closures', title: 'Explain closures', value: 4 },
            { id: '2', title: 'No topic question', value: 3 },
          ],
        },
      },
      practice: {
        values: {
          comment: 'good practice',
          questions: [{ id: '3', topic: 'Arrays', title: 'Reverse an array', value: 5 }],
        },
      },
    };

    it('renders the non-rejected feedback items', () => {
      render(<PrescreeningFeedback {...makeFeedback(steps)} />);
      expect(screen.getByText('none observed')).toBeInTheDocument();
      expect(screen.getByText('strong candidate')).toBeInTheDocument();
      expect(screen.getByText('IELTS 7.0')).toBeInTheDocument();
      expect(screen.getByText('B2 level')).toBeInTheDocument();
      expect(screen.getByText('learned at university')).toBeInTheDocument();
      // intro comment (isRejectedInterviewItem) must NOT show
      expect(screen.queryByText('should not show')).not.toBeInTheDocument();
    });

    it('renders both Theory and Practice skill sections with topic and no-topic rows', () => {
      render(<PrescreeningFeedback {...makeFeedback(steps)} />);
      expect(screen.getByText('Theory')).toBeInTheDocument();
      expect(screen.getByText('Practice')).toBeInTheDocument();
      // SkillTable: row with topic
      expect(screen.getByText('Closures')).toBeInTheDocument();
      expect(screen.getByText('Explain closures')).toBeInTheDocument();
      // SkillTable: row without topic still renders the title
      expect(screen.getByText('No topic question')).toBeInTheDocument();
      expect(screen.getByText('Reverse an array')).toBeInTheDocument();
      // SkillSection comments
      expect(screen.getByText('good theory')).toBeInTheDocument();
      expect(screen.getByText('good practice')).toBeInTheDocument();
    });
  });

  describe('when the interview IS rejected', () => {
    const steps: Steps = {
      decision: { values: { redFlags: 'hidden', comment: 'hidden' } },
      english: { values: {} },
      intro: { values: { interviewResult: 'missed', comment: 'candidate did not show up' } },
      theory: { values: { questions: [] } },
      practice: { values: { questions: [] } },
    };

    it('renders only the intro comment and no skill sections', () => {
      render(<PrescreeningFeedback {...makeFeedback(steps)} />);
      expect(screen.getByText('candidate did not show up')).toBeInTheDocument();
      // non-rejected items must NOT show
      expect(screen.queryByText('hidden')).not.toBeInTheDocument();
      expect(screen.queryByText('Theory')).not.toBeInTheDocument();
      expect(screen.queryByText('Practice')).not.toBeInTheDocument();
    });
  });

  describe('not rejected but with missing/empty values', () => {
    const steps: Steps = {
      decision: { values: { redFlags: '', comment: '' } },
      english: { values: {} },
      intro: { values: { interviewResult: 'completed' } },
      theory: { values: undefined },
      practice: { values: undefined },
    };

    it('renders no FeedbackItems for empty values and no skill sections when values are undefined', () => {
      render(<PrescreeningFeedback {...makeFeedback(steps)} />);
      // FeedbackItem returns null for empty strings -> none of the labels appear
      expect(screen.queryByText('Red flags:')).not.toBeInTheDocument();
      expect(screen.queryByText('Certified level of English:')).not.toBeInTheDocument();
      // SkillSection returns null when skills is undefined
      expect(screen.queryByText('Theory')).not.toBeInTheDocument();
      expect(screen.queryByText('Practice')).not.toBeInTheDocument();
    });
  });
});
