import { CoursesInterviewsApi, InterviewFeedbackDto, ProfileCourseDto } from 'api';
import { InterviewFeedbackValues, FeedbackStep, Feedback } from 'data/interviews/technical-screening';
import { createContext, PropsWithChildren, useCallback, useMemo, useState } from 'react';
import { useLoading } from 'components/useLoading';
import { message } from 'antd';
import { useRouter } from 'next/router';
import { getDefaultStep, getFeedbackFromTemplate, getUpdatedFeedback, isInterviewRejected } from './test';

type ContextProps = {
  course: ProfileCourseDto;
  interviewId: number;
  interviewFeedback: InterviewFeedbackDto | null;
  type: string;
  interviewMaxScore: number;
};

type StepApi = {
  activeStepIndex: number;
  steps: FeedbackStep[];
  next: (values: InterviewFeedbackValues) => void;
  prev: () => void;
  onValuesChange(_: InterviewFeedbackValues, values: InterviewFeedbackValues): void;
  loading: boolean;
  isFinalStep: boolean;
};

export const StepContext = createContext<StepApi>({} as StepApi);

export function StepContextProvider(props: PropsWithChildren<ContextProps>) {
  const { interviewFeedback, children, course, interviewId, type, interviewMaxScore } = props;
  const router = useRouter();
  const [loading, withLoading] = useLoading(false, error => {
    message.error('An unexpected error occurred. Please try later.');
    throw error;
  });

  const [feedback, setFeedback] = useState<Feedback>(() =>
    getFeedbackFromTemplate(interviewFeedback, interviewMaxScore),
  );
  const [activeStepIndex, setActiveIndex] = useState(() => getDefaultStep(feedback));
  const activeStep = feedback.steps[activeStepIndex];

  const [isFinished, setIsFinished] = useState(() => isInterviewRejected(activeStep.id, activeStep.values));
  const isFinalStep = activeStepIndex === feedback.steps.length - 1 || isFinished;

  const saveFeedback = withLoading(async (values: InterviewFeedbackValues) => {
    const { feedbackValues, steps, isCompleted, rating, decision, isGoodCandidate } = getUpdatedFeedback({
      feedback,
      newValues: values,
      activeStepIndex,
      interviewMaxScore,
    });
    await new CoursesInterviewsApi().createInterviewFeedback(course.id, interviewId, type, {
      isCompleted,
      rating,
      decision,
      isGoodCandidate,
      json: feedbackValues,
      version: feedback.version,
    });

    setFeedback({
      isCompleted,
      steps,
      version: feedback.version,
    });
  });

  const onValuesChange = useCallback(
    (_: InterviewFeedbackValues, values: InterviewFeedbackValues) => {
      setIsFinished(isInterviewRejected(activeStep.id, values));
    },
    [activeStep.id],
  );

  const next = useCallback(
    async (values: InterviewFeedbackValues) => {
      try {
        await saveFeedback(values);
      } catch {
        return;
      }
      if (isFinalStep) {
        router.push(`/course/mentor/interviews?course=${course.alias}`);
        return;
      }

      setActiveIndex(index => {
        if (index === feedback.steps.length - 1) {
          return index;
        }

        return index + 1;
      });
    },
    [feedback.steps, isFinalStep, activeStepIndex],
  );

  const prev = useCallback(() => {
    setActiveIndex(index => {
      if (index === 0) {
        return index;
      }

      return index - 1;
    });
  }, []);

  const api = useMemo(
    () => ({
      activeStepIndex,
      steps: feedback.steps,
      next,
      prev,
      onValuesChange,
      loading,
      isFinalStep,
    }),
    [activeStepIndex, feedback.steps, isFinalStep, loading, onValuesChange],
  );

  return <StepContext.Provider value={api}>{children}</StepContext.Provider>;
}
