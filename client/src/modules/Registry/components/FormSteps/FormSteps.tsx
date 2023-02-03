import { Col, Steps } from 'antd';
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
    <>
      <Col
        span={24}
        style={{
          background: '#FFFFFF',
          borderRadius: 2,
          paddingBlock: 16,
          paddingInline: 60,
        }}
      >
        <Steps current={currentStep} responsive={false}>
          {steps.map(item => (
            <Step key={item.title} title={isSmallScreen ? null : item.title} />
          ))}
        </Steps>
      </Col>
      <Col span={24}>{steps[currentStep].content}</Col>
    </>
  );
}
