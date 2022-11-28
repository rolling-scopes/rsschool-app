import { InterviewDto } from 'api';
import { RegistrationNotice } from './RegistrationNotice';

export function InterviewDetails(props: { interview: InterviewDto }) {
  const { interview } = props;
  const { startDate, name } = interview;

  return (
    <>
      <RegistrationNotice name={name} startDate={startDate} showMentorOptions={showMentorOptions} />
    </>
  );

  function showMentorOptions(e: React.MouseEvent) {
    e.stopPropagation();
  }
}
