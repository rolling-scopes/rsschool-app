import { Button, Steps } from 'antd';
import { MentorStep } from '../MentorStep';
import css from 'styled-jsx/css';

type Props = {
  currentStep: number;
  steps: { title: string; content: () => JSX.Element }[];
  onPrev: () => void;
  onStart: (value: boolean) => void;
};

export function MentorStepRegistration(props: Props) {
  const { steps, currentStep, onPrev, onStart } = props;
  const header = (
    <>
      <div className="steps-wrapper">
        <Steps direction="vertical" current={currentStep} style={{ height: 150 }}>
          {steps.map(step => (
            <Steps.Step key={step.title} title={step.title} />
          ))}
        </Steps>
      </div>
      <style jsx>{styles}</style>
    </>
  );
  return (
    <MentorStep type="wider" header={header}>
      {steps[currentStep].content()}
      <div className="steps-action">
        {currentStep < steps.length - 1 && (
          <Button size="large" type="primary" htmlType="submit">
            Next
          </Button>
        )}
        {currentStep === steps.length - 1 && (
          <Button size="large" type="primary" htmlType="submit">
            Submit
          </Button>
        )}
        {currentStep > 0 && (
          <Button size="large" style={{ margin: '0 16px' }} onClick={() => onPrev()}>
            Previous
          </Button>
        )}
        {currentStep === 0 && (
          <Button size="large" style={{ margin: '0 16px' }} onClick={() => onStart(true)}>
            Previous
          </Button>
        )}
      </div>
      <style jsx>{contentStyles}</style>
    </MentorStep>
  );
}

const styles = css`
  .steps-wrapper {
    margin: 100px 0 0 25px;
  }
  .steps-wrapper :global(.ant-steps-item-wait .ant-steps-item-icon) {
    background: #141414 !important;
    border-color: rgba(255, 255, 255, 0.3) !important;
  }
  .steps-wrapper :global(.ant-steps-item-wait .ant-steps-item-icon .ant-steps-icon) {
    color: rgba(255, 255, 255, 0.3) !important;
    font-weight: 500;
  }
  .steps-wrapper :global(.ant-steps-item-process .ant-steps-item-icon) {
    background: #fadb14 !important;
    border-color: #fadb14 !important;
  }
  .steps-wrapper :global(.ant-steps-item-process .ant-steps-item-icon .ant-steps-icon) {
    color: #1f1f1f !important;
    font-weight: 500;
    top: -3px;
  }
  .steps-wrapper :global(.ant-steps-item-process .ant-steps-item-tail::after) {
    background-color: rgba(255, 255, 255, 0.3) !important;
  }
  .steps-wrapper :global(.ant-steps-item-finish .ant-steps-item-icon) {
    background: #141414 !important;
    border-color: #fadb14 !important;
  }
  .steps-wrapper :global(.ant-steps-item-finish .ant-steps-item-icon .ant-steps-icon) {
    color: #fadb14 !important;
    font-weight: 500;
  }
  .steps-wrapper :global(.ant-steps-item-finish .ant-steps-item-tail::after) {
    background-color: #fadb14 !important;
  }
  .steps-wrapper :global(.ant-steps-item-content .ant-steps-item-title) {
    color: rgba(255, 255, 255, 0.85) !important;
  }

  @media (max-width: 575px) {
    .steps-wrapper {
      display: none;
    }
  }
`;

const contentStyles = css.global`
  .descriptions-name {
    color: rgba(0, 0, 0, 0.45);
  }
  .descriptions-name.last {
    visibility: hidden;
  }

  @media (max-width: 575px) {
    .descriptions-name.last {
      visibility: visible;
    }
  }
`;
