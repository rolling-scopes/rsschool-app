import { Steps } from 'antd';
import { useFormLayout } from 'modules/Registry/hooks';

const { Step } = Steps;

type Step = {
  title: string;
  content: JSX.Element;
};

type Props = {
  steps: Step[];
  currentStep: number;
};

export function FormSteps({ steps, currentStep }: Props) {
  const { isSmallScreen } = useFormLayout();

  return (
    <Steps current={currentStep} responsive={false}>
      {steps.map(item => (
        <Step key={item.title} title={isSmallScreen ? null : item.title} />
      ))}
    </Steps>
  );
}
