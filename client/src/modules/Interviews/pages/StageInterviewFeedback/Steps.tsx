import { Steps as Stepper } from 'antd';
import { useContext } from 'react';
import { StepContext } from './StepContext';

export function Steps() {
  const { activeStepIndex, steps } = useContext(StepContext);

  return (
    <Stepper
      direction="vertical"
      current={activeStepIndex}
      size={'small'}
      style={{ padding: 24 }}
      items={steps.map((step, index) => ({
        title: step.title,
        description: step.stepperDescription,
        status: getStatus(index),
      }))}
    />
  );

  function getStatus(index: number) {
    if (index === activeStepIndex) {
      return 'process';
    }
    return steps[index].isCompleted ? 'finish' : 'wait';
  }
}
