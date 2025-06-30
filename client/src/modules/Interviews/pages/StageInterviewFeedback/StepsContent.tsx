import { useContext } from 'react';
import { StepContext } from './StepContext';
import { StepForm } from './StepForm';
import { Spin } from 'antd';

export function StepsContent() {
  const { activeStepIndex, steps, next, prev, onValuesChange, loading, isFinalStep } = useContext(StepContext);
  const step = steps[activeStepIndex];

  if (!step) {
    return <div>Step not found</div>;
  }

  return (
    <Spin spinning={loading}>
      <StepForm
        step={step}
        back={prev}
        isFirst={activeStepIndex === 0}
        isLast={isFinalStep}
        next={next}
        onValuesChange={onValuesChange}
        key={step.id}
      />
    </Spin>
  );
}
