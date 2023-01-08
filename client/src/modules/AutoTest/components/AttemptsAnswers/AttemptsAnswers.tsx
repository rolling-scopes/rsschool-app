import { Typography } from 'antd';
import { TaskVerificationAttemptDto } from 'api';

type Props = {
  answers: TaskVerificationAttemptDto[];
};

const { Title } = Typography;

function AttemptsAnswers({ answers }: Props) {
  return (
    <>
      {answers.map((answer, idx) => (
        <>
          <Title level={5}>Attempt #{answers.length - idx}</Title>
          {answer.questions.map((q: any) => (
            <div>{q.question}</div>
          ))}
          {/* <SelfEducation /> */}
        </>
      ))}
    </>
  );
}

export default AttemptsAnswers;
