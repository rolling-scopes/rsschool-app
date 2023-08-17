import { InterviewFeedbackDto } from 'api';
import {
  Feedback,
  FeedbackStep,
  FeedbackStepId,
  InterviewFeedbackStepData,
  InterviewFeedbackValues,
  InterviewQuestion,
  feedbackTemplate,
} from 'data/interviews/technical-screening';

type FeedbackData = {
  steps: InterviewFeedbackStepData[];
};

/**
 * Based on existing feedback data returns default template or merges data with its version template
 */
export function getFeedbackFromTemplate(interviewFeedback: InterviewFeedbackDto | null, interviewMaxScore: number) {
  // no feedback yet, return all steps based on latest version
  if (!interviewFeedback) {
    return {
      steps: feedbackTemplate.steps.map(step => ({ ...step, isCompleted: false })),
      isCompleted: false,
      version: feedbackTemplate.version,
    };
  }

  const { isCompleted, json, version } = interviewFeedback;

  return mergeFeedbackValuesToTemplate(
    {
      version,
      isCompleted,
      steps: feedbackTemplate.steps,
    } as Feedback,
    json as FeedbackData,
    interviewMaxScore,
  );
}

/**
 * Looks for either first incomplete step or the final one
 */
export function getDefaultStep(feedback: Feedback) {
  for (let i = 0; i < feedback.steps.length; i++) {
    const { isCompleted, id, values } = feedback.steps[i];

    if (!isCompleted || isInterviewRejected(id, values)) {
      return i;
    }
  }

  return feedback.isCompleted ? feedback.steps.length - 1 : 0;
}

/**
 * checks whether the step contains rejection value
 */
export function isInterviewRejected(stepId: FeedbackStepId, stepValues: InterviewFeedbackValues = {}) {
  return stepId === FeedbackStepId.Introduction && stepValues.interviewResult === 'missed';
}

export function mergeFeedbackValuesToTemplate(feedback: Feedback, data: FeedbackData, interviewMaxScore: number) {
  const { steps } = data;

  return {
    ...feedback,
    steps: feedback.steps.map((step, _, newSteps) => {
      const stepData = steps.find(item => item.id == step.id);
      const result = {
        ...step,
        ...stepData,
      };
      if ((result.id === FeedbackStepId.Theory || step.id === FeedbackStepId.Practice) && result.values) {
        result.values.score = calculateStepScore(step, interviewMaxScore);
      }
      if (result.id === FeedbackStepId.Decision) {
        result.items = result.items.map(item => {
          if (item.id === 'finalScore') {
            return {
              ...item,
              defaultValue: calculateFinalScore(newSteps),
            };
          }
          return item;
        });
      }
      return result;
    }),
  };
}

export function getUpdatedFeedback({
  activeStepIndex,
  feedback,
  interviewMaxScore,
  newValues,
}: {
  feedback: Feedback;
  newValues: InterviewFeedbackValues;
  activeStepIndex: number;
  interviewMaxScore: number;
}) {
  const { steps } = feedback;
  const isRejected = isInterviewRejected(steps[activeStepIndex].id, newValues);

  const feedbackValues = {
    steps: steps.map((step, index) => {
      if (index === activeStepIndex) {
        return {
          id: step.id,
          isCompleted: true,
          values: newValues,
        };
      }

      // if is rejected, all steps after the current one should be marked as not completed and values should be removed
      return {
        id: step.id,
        values: isRejected ? undefined : step.values,
        isCompleted: isRejected ? false : step.isCompleted,
      };
    }),
  };
  const newFeedback = mergeFeedbackValuesToTemplate(feedback, feedbackValues, interviewMaxScore);

  return {
    steps: newFeedback.steps,
    feedbackValues,
    isCompleted: isInterviewCompleted(newFeedback),
    ...getInterviewSummary(newFeedback),
  };
}

/**
 * Calculates rating/decision & isGoodCandidate using latest feedback state
 */
function getInterviewSummary(feedback: Feedback) {
  const { steps } = feedback;
  const decision = steps.find(step => step.id === FeedbackStepId.Decision);

  return {
    score: (decision?.values?.finalScore as number) ?? undefined,
    decision: getDecision(),
    isGoodCandidate: getIsGoodCandidate(),
  };

  function getIsGoodCandidate() {
    if (decision?.values?.isGoodCandidate == undefined) {
      return;
    }

    return (decision.values.isGoodCandidate as string[]).includes('true');
  }

  function getDecision() {
    const introduction = steps.find(step => step.id === FeedbackStepId.Introduction);
    const isInterviewConducted = !isInterviewRejected(FeedbackStepId.Introduction, introduction?.values);

    if (!isInterviewConducted) {
      // if the interview was missed, return the reason
      return introduction?.values?.['missed'] as string;
    }

    return decision?.values?.decision as string;
  }
}

function isInterviewCompleted(feedback: Feedback) {
  const { steps } = feedback;
  const introduction = feedback.steps.find(step => step.id === FeedbackStepId.Introduction);
  return (
    (introduction && isInterviewRejected(introduction.id, introduction.values)) || steps.every(step => step.isCompleted)
  );
}

function calculateFinalScore(steps: Feedback['steps']) {
  const theory = (steps.find(step => step.id === FeedbackStepId.Theory)?.values?.score as number | undefined) ?? 0;
  const practice = (steps.find(step => step.id === FeedbackStepId.Practice)?.values?.score as number | undefined) ?? 0;

  return theory + practice;
}

/**
 * Calculates current step score based on questions values
 */
function calculateStepScore(step: FeedbackStep, interviewMaxScore: number) {
  const { values = {} } = step;
  const questions = values.questions as unknown as InterviewQuestion[] | undefined;

  if (!questions) {
    return 0;
  }
  const scorePerQuestion = interviewMaxScore / questions.length;

  return Math.round(
    questions.reduce((score, question) => {
      if (!question.value) {
        return score;
      }
      const maxQuestionRating = 5;
      const proportion = question.value / maxQuestionRating;
      const questionScore = proportion * scorePerQuestion;
      return score + questionScore;
    }, 0),
  );
}
