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
  steps: Record<FeedbackStepId, InterviewFeedbackStepData>;
};

/**
 * Based on existing feedback data returns default template or merges data with its version template
 */
export function getFeedbackFromTemplate(interviewFeedback: InterviewFeedbackDto, interviewMaxScore: number): Feedback {
  // no feedback yet, return all steps based on latest version
  if (!interviewFeedback.json) {
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

    if (!isCompleted || isInterviewCanceled(id, values) || i === feedback.steps.length - 1) {
      return i;
    }
  }

  return 0;
}

/**
 * checks whether the step contains rejection value
 */
export function isInterviewCanceled(stepId: FeedbackStepId, stepValues: InterviewFeedbackValues = {}) {
  return stepId === FeedbackStepId.Introduction && stepValues.interviewResult === 'missed';
}

/**
 * Merges save feedback data with template
 */
function mergeFeedbackValuesToTemplate(feedback: Feedback, data: FeedbackData, interviewMaxScore: number): Feedback {
  const { steps } = data;

  const mergedFeedback = {
    ...feedback,
    steps: feedback.steps.map(step => {
      const stepData = steps[step.id];
      const result = {
        ...step,
        ...stepData,
      };
      const ratedSteps = [FeedbackStepId.Theory, FeedbackStepId.Practice];

      if (ratedSteps.includes(result.id) && result.values) {
        result.values.score = calculateStepScore(result, interviewMaxScore / ratedSteps.length);
      }

      return result;
    }),
  };

  return applyDefaultFinalScore(mergedFeedback, interviewMaxScore);
}

function applyDefaultFinalScore(mergedFeedback: Feedback, interviewMaxScore: number) {
  return {
    ...mergedFeedback,
    steps: mergedFeedback.steps.map(step => {
      if (step.id !== FeedbackStepId.Decision) {
        return step;
      }
      return {
        ...step,
        items: step.items.map(item => {
          if (item.id === 'finalScore') {
            return {
              ...item,
              defaultValue: calculateFinalScore(mergedFeedback.steps),
              max: interviewMaxScore,
            };
          }
          return item;
        }),
      };
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
  const isCanceled = isInterviewCanceled(steps[activeStepIndex].id, newValues);

  const feedbackValues = {
    steps: generateFeedbackValues(steps, activeStepIndex, newValues, isCanceled),
  };
  const newFeedback = mergeFeedbackValuesToTemplate(feedback, feedbackValues, interviewMaxScore);

  return {
    steps: newFeedback.steps,
    feedbackValues,
    isCompleted: isInterviewCompleted(newFeedback),
    ...getInterviewSummary(newFeedback),
  };
}

function generateFeedbackValues(
  steps: FeedbackStep[],
  activeStepIndex: number,
  newValues: InterviewFeedbackValues,
  isCanceled: boolean,
): Record<FeedbackStepId, InterviewFeedbackStepData> {
  return steps.reduce(
    (stepMap, step, index) => {
      if (index === activeStepIndex) {
        stepMap[step.id] = {
          isCompleted: true,
          values: newValues,
        };
        return stepMap;
      }

      // if is canceled, all steps after the current one should be marked as not completed and values should be removed
      stepMap[step.id] = {
        values: isCanceled ? undefined : step.values,
        isCompleted: isCanceled ? false : step.isCompleted,
      };
      return stepMap;
    },
    {} as Record<FeedbackStepId, InterviewFeedbackStepData>,
  );
}

/**
 * Calculates rating/decision & isGoodCandidate using latest feedback state
 */
function getInterviewSummary(feedback: Feedback) {
  const { steps } = feedback;
  const decision = steps.find(step => step.id === FeedbackStepId.Decision);
  const introduction = steps.find(step => step.id === FeedbackStepId.Introduction);
  const isInterviewConducted = !isInterviewCanceled(FeedbackStepId.Introduction, introduction?.values);

  return {
    score: isInterviewConducted ? (decision?.values?.finalScore as number) : 0,
    decision: getDecision(),
    isGoodCandidate: getIsGoodCandidate(),
  };

  function getIsGoodCandidate() {
    if (!isInterviewConducted) {
      return false;
    }
    if (decision?.values?.isGoodCandidate == undefined) {
      return;
    }

    return (decision.values.isGoodCandidate as string[]).includes('true');
  }

  function getDecision() {
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
    (introduction && isInterviewCanceled(introduction.id, introduction.values)) || steps.every(step => step.isCompleted)
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
