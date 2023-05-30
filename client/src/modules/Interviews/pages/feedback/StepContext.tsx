import { StepId } from 'data/interviews';
import { feedbackSteps, Step } from 'data/interviews/technical-screening';
import { createContext, PropsWithChildren, useCallback, useMemo, useState } from 'react';

type StepApi = {
  activeStepIndex: number;
  steps: (Step & { isCompleted?: boolean })[];
  next: () => void;
  prev: () => void;
};

export const StepContext = createContext<StepApi>({} as StepApi);

type Props = {
  stepsStatus: Partial<Record<StepId, boolean>>;
};

export function StepContextProvider(props: PropsWithChildren<Props>) {
  const { stepsStatus, children } = props;

  const [activeStepIndex, setActiveIndex] = useState(() => {
    // find the first step that is not completed
    for (let i = 0; i < feedbackSteps.length; i++) {
      if (!stepsStatus[feedbackSteps[i].id]) {
        return i;
      }
    }

    return 0;
  });

  const steps = useMemo(
    () => feedbackSteps.map(step => ({ ...step, isCompleted: stepsStatus[step.id] })),
    [stepsStatus],
  );

  const next = useCallback(() => {
    setActiveIndex(index => {
      if (index === steps.length - 1) {
        return index;
      }

      return index + 1;
    });
  }, [steps]);

  const prev = useCallback(() => {
    setActiveIndex(index => {
      if (index === 0) {
        return index;
      }

      return index - 1;
    });
  }, [steps]);

  const api = useMemo(
    () => ({
      activeStepIndex,
      steps,
      next,
      prev,
    }),
    [activeStepIndex, steps],
  );

  return <StepContext.Provider value={api}>{children}</StepContext.Provider>;
}
