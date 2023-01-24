import { InterviewDto } from 'api';
import { RegistrationNotice } from './RegistrationNotice';

export function InterviewDetails(props: { interview: InterviewDto }) {
  const { interview } = props;
  const { startDate } = interview;

  return <RegistrationNotice interview={interview} startDate={startDate} />;
}
