import {
  getFeedbackFromTemplate,
  getDefaultStep,
  isInterviewCanceled,
  getUpdatedFeedback,
} from './feedbackTemplateHandler';
import {
  Decision,
  Feedback,
  FeedbackStepId,
  InterviewFeedbackValues,
  feedbackTemplate,
} from 'data/interviews/technical-screening';

describe('getFeedbackFromTemplate', () => {
  test('should return default template when no feedback exists', () => {
    const interviewFeedback = { json: undefined, isCompleted: false, maxScore: 100 };

    const feedback = getFeedbackFromTemplate(interviewFeedback, 100);

    expect(feedback.steps.length).toBe(feedbackTemplate.steps.length);
    expect(feedback.isCompleted).toBe(false);
    expect(feedback.version).toBe(feedbackTemplate.version);
  });

  test('should merge feedback data with template', () => {
    const interviewFeedback = {
      json: {
        steps: {
          [FeedbackStepId.Introduction]: {
            isCompleted: true,
            values: { interviewResult: 'completed' },
          },
          [FeedbackStepId.Theory]: {
            isCompleted: true,
            values: { questions: [{ value: 3 }] },
          },
        },
      },
      version: 1,
      isCompleted: true,
      maxScore: 100,
    };

    const feedback = getFeedbackFromTemplate(interviewFeedback, 100);

    expect(feedback.steps.length).toBe(feedbackTemplate.steps.length);
    expect(feedback.isCompleted).toBe(true);
    expect(feedback.version).toBe(1);

    expect(feedback.steps[0]?.isCompleted).toBe(true);
    expect(feedback.steps[0]?.values?.interviewResult).toBe('completed');
    expect(feedback.steps[1]?.isCompleted).toBe(true);
    expect(feedback.steps[1]?.values).toEqual({ questions: [{ value: 3 }], score: 30 });

    expect(feedback.steps[2]?.isCompleted).toBe(undefined);
  });
});

describe('getDefaultStep', () => {
  test('should return the first incomplete step', () => {
    const feedback = {
      steps: [
        { id: FeedbackStepId.Introduction, isCompleted: true },
        { id: FeedbackStepId.Theory, isCompleted: false },
        { id: FeedbackStepId.Practice, isCompleted: false },
        { id: FeedbackStepId.Decision, isCompleted: false },
      ],
      version: 1,
      isCompleted: false,
    };
    const defaultStep = getDefaultStep(feedback as Feedback);
    expect(defaultStep).toBe(1);
  });

  test('should return the final step if all steps are completed', () => {
    const feedback = {
      steps: [
        { id: FeedbackStepId.Introduction, isCompleted: true },
        { id: FeedbackStepId.Theory, isCompleted: true },
        { id: FeedbackStepId.Practice, isCompleted: true },
        { id: FeedbackStepId.Decision, isCompleted: true },
      ],
      isCompleted: true,
    };
    const defaultStep = getDefaultStep(feedback as Feedback);
    expect(defaultStep).toBe(3);
  });

  test('should return intro step if interview is not conducted', () => {
    const feedback = {
      steps: [
        { id: FeedbackStepId.Introduction, isCompleted: true, values: { interviewResult: 'missed' } },
        { id: FeedbackStepId.Theory, isCompleted: false },
        { id: FeedbackStepId.Practice, isCompleted: false },
        { id: FeedbackStepId.Decision, isCompleted: false },
      ],
      isCompleted: false,
    };
    const defaultStep = getDefaultStep(feedback as Feedback);
    expect(defaultStep).toBe(0);
  });
});

describe('isInterviewCanceled', () => {
  test('should return true if interview is rejected on the intro step', () => {
    const stepValues = { interviewResult: 'missed' };
    const isRejected = isInterviewCanceled(FeedbackStepId.Introduction, stepValues);

    expect(isRejected).toBe(true);
  });

  test('should return false if not rejected on intro step', () => {
    const stepValues = { interviewResult: 'completed' };
    const isRejected = isInterviewCanceled(FeedbackStepId.Introduction, stepValues);

    expect(isRejected).toBe(false);
  });

  test('should return false if not a intro step', () => {
    const stepValues = {};
    const isRejected = isInterviewCanceled(FeedbackStepId.Theory, stepValues);

    expect(isRejected).toBe(false);
  });
});

describe('getUpdatedFeedback', () => {
  test('should mark active index as completed and return new feedback', () => {
    const feedback = {
      version: 1,
      isCompleted: false,
      steps: [
        { id: FeedbackStepId.Introduction, isCompleted: true, items: [], values: { interviewResult: 'completed' } },
        { id: FeedbackStepId.Theory, isCompleted: false, items: [] },
        { id: FeedbackStepId.Practice, isCompleted: false, items: [] },
        { id: FeedbackStepId.Decision, isCompleted: false, items: [] },
      ],
    } as unknown as Feedback;
    const newValues: InterviewFeedbackValues = { questions: [{ id: '1', title: 'test', value: 3 }] };
    const activeStepIndex = 1;

    const updatedFeedback = getUpdatedFeedback({ feedback, newValues, activeStepIndex, interviewMaxScore: 100 });

    expect(updatedFeedback.steps[0]?.isCompleted).toBe(true);
    expect(updatedFeedback.steps[1]?.isCompleted).toBe(true);
    expect(updatedFeedback.steps[1]?.values?.questions).toEqual([{ id: '1', title: 'test', value: 3 }]);
    expect(updatedFeedback.feedbackValues).toEqual({
      steps: {
        decision: {
          isCompleted: false,
          values: undefined,
        },
        intro: {
          isCompleted: true,
          values: { interviewResult: 'completed' },
        },
        practice: {
          isCompleted: false,
          values: undefined,
        },
        theory: {
          isCompleted: true,
          values: {
            questions: [
              {
                id: '1',
                title: 'test',
                value: 3,
              },
            ],
            score: 30,
          },
        },
      },
    });
    expect(updatedFeedback.steps[2]?.isCompleted).toBe(false);
    expect(updatedFeedback.steps[2]?.values).toBeUndefined();
    expect(updatedFeedback.steps[3]?.isCompleted).toBe(false);
    expect(updatedFeedback.steps[3]?.values).toBeUndefined();
    expect(updatedFeedback.isCompleted).toBe(false);
    expect(updatedFeedback.score).toBeUndefined();
    expect(updatedFeedback.decision).toBeUndefined();
    expect(updatedFeedback.isGoodCandidate).toBeUndefined();
  });

  test('should mark all steps as completed if interview is completed', () => {
    const feedback = {
      version: '1.0',
      isCompleted: false,
      steps: [
        { id: FeedbackStepId.Introduction, isCompleted: true, items: [], values: { interviewResult: 'completed' } },
        { id: FeedbackStepId.Theory, isCompleted: true, items: [], values: { questions: [{ value: 3 }] } },
        { id: FeedbackStepId.Practice, isCompleted: true, items: [], values: { questions: [{ value: 4 }] } },
        { id: FeedbackStepId.Decision, isCompleted: false, items: [] },
      ],
    } as unknown as Feedback;
    const newValues = { decision: Decision.Yes, isGoodCandidate: ['true'], finalScore: 8 };
    const activeStepIndex = 3;
    const interviewMaxScore = 10;
    const updatedFeedback = getUpdatedFeedback({ feedback, newValues, activeStepIndex, interviewMaxScore });

    expect(updatedFeedback.steps.every(step => step.isCompleted)).toBe(true);
    expect(updatedFeedback.decision).toBe(Decision.Yes);
    expect(updatedFeedback.isGoodCandidate).toBeTruthy();
    expect(updatedFeedback.isCompleted).toBeTruthy();
    expect(updatedFeedback.score).toBe(8);
    expect(updatedFeedback.feedbackValues).toEqual({
      steps: {
        decision: {
          isCompleted: true,
          values: {
            decision: Decision.Yes,
            isGoodCandidate: ['true'],
            finalScore: 8,
          },
        },
        intro: {
          isCompleted: true,
          values: { interviewResult: 'completed' },
        },
        practice: {
          isCompleted: true,
          values: {
            questions: [{ value: 4 }],
            score: 4,
          },
        },
        theory: {
          isCompleted: true,
          values: {
            questions: [{ value: 3 }],
            score: 3,
          },
        },
      },
    });
  });
});
