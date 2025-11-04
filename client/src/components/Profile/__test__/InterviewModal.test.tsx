import React from 'react';
import { render, screen, within } from '@testing-library/react';
import InterviewModal from '../InterviewModal';
import { CoreJsInterviewFeedback, LegacyFeedback, StageInterviewDetailedFeedback } from '@common/models/profile';

const noop = () => {};

describe('InterviewModal', () => {
  it('renders CoreJS modal with score, interviewer, comment and answers table', async () => {
    const coreJsData: CoreJsInterviewFeedback = {
      courseName: 'JS Course',
      courseFullName: 'JS Course 2021',
      locationName: 'EU',
      interviews: [
        {
          name: 'CoreJS Interview A',
          score: 42,
          comment: 'Great student',
          answers: [
            { questionId: 'q1', questionText: 'Understands closures?', answer: true },
            { questionId: 'q2', questionText: 'Knows event loop?', answer: false },
          ],
          interviewer: { name: 'Alice', githubId: 'alice' },
          interviewDate: '2021-06-01',
        },
      ],
    };

    render(<InterviewModal isVisible={true} onHide={noop} coreJs={{ data: coreJsData, idx: 0 }} />);

    expect(screen.getByText(/JS Course 2021 CoreJS Interview Feedback/)).toBeInTheDocument();
    expect(screen.getByText(/Score:/)).toBeInTheDocument();
    expect(screen.getByText('42')).toBeInTheDocument();
    expect(screen.getByText(/Interviewer/)).toBeInTheDocument();
    expect(screen.getByText('Alice')).toBeInTheDocument();
    expect(screen.getByText(/Great student/)).toBeInTheDocument();

    const table = screen.getByTestId('profile-corejs-iviews-modal-table');
    const rows = within(table).getAllByRole('row');
    expect(rows.length).toBeGreaterThan(1);
    expect(screen.getByText('Yes')).toBeInTheDocument();
    expect(screen.getByText('No')).toBeInTheDocument();
  });

  it('renders Pre-Screening (legacy v0) modal content', () => {
    const legacyFeedback: LegacyFeedback = {
      comment: 'Legacy comment',
      english: 'b1',
      programmingTask: { task: 'FizzBuzz', codeWritingLevel: 3, resolved: 1, comment: 'ok' },
      skills: { htmlCss: 3, common: 2, dataStructures: 4 },
    };

    const data: StageInterviewDetailedFeedback = {
      decision: 'yes',
      isGoodCandidate: true,
      courseName: 'rs-2020-q1',
      courseFullName: 'Rolling Scopes School 2020 Q1',
      score: 34,
      maxScore: 50,
      date: '2020-05-17',
      version: 0,
      interviewer: { name: 'Inter Viewer', githubId: 'interviewer' },
      feedback: legacyFeedback,
    };

    render(<InterviewModal isVisible={true} onHide={noop} prescreening={{ data, idx: 0 }} />);

    expect(screen.getByText(/Rolling Scopes School 2020 Q1 Pre-Screening Interview Feedback/)).toBeInTheDocument();
    expect(screen.getByText('Completed')).toBeInTheDocument();
    expect(screen.getByText('3.40')).toBeInTheDocument();
    expect(screen.getByText(/Interviewer/)).toBeInTheDocument();
    expect(screen.getByText('Inter Viewer')).toBeInTheDocument();
  });

  it('renders Pre-Screening (v1) modal content with sections', () => {
    const data: StageInterviewDetailedFeedback = {
      decision: 'yes',
      isGoodCandidate: false,
      courseName: 'rs-2021-q1',
      courseFullName: 'Rolling Scopes School 2021 Q1',
      score: 40,
      maxScore: 50,
      date: '2021-03-21',
      version: 1,
      interviewer: { name: 'Bob', githubId: 'bob' },
      feedback: {
        steps: {
          intro: { isCompleted: true, values: { interviewResult: 'completed' } },
          english: {
            isCompleted: true,
            values: { englishCertificate: 'B2', selfAssessment: 'B2', comment: 'self learned' },
          },
          theory: {
            isCompleted: true,
            values: {
              questions: [
                { id: 't1', title: 'Arrays', topic: 'JS', value: 3 },
                { id: 't2', title: 'Promises', topic: 'JS', value: 4 },
              ],
              comment: 'theory ok',
            },
          },
          practice: {
            isCompleted: true,
            values: {
              questions: [
                { id: 'p1', title: 'Implement map', topic: 'JS', value: 3 },
                { id: 'p2', title: 'Optimize loop', topic: 'Perf', value: 2 },
              ],
              comment: 'practice ok',
            },
          },
          decision: { isCompleted: true, values: { redFlags: 'none', comment: 'looks ok' } },
        },
      },
    };

    render(<InterviewModal isVisible={true} onHide={noop} prescreening={{ data, idx: 0 }} />);

    expect(screen.getByText(/Rolling Scopes School 2021 Q1 Pre-Screening Interview Feedback/)).toBeInTheDocument();
    expect(screen.getByText('Completed')).toBeInTheDocument();
    expect(screen.getByText('Theory')).toBeInTheDocument();
    expect(screen.getByText('Practice')).toBeInTheDocument();
    expect(screen.getByText(/Certified level of English/)).toBeInTheDocument();
    expect(screen.getByText(/English level by interviewers opinion/)).toBeInTheDocument();
  });
});
