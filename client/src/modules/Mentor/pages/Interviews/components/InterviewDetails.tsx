import { InterviewDto } from '@client/api';
import { isInterviewRegistrationInProgress, isInterviewStarted } from 'domain/interview';
import { MentorInterview } from 'services/course';
import { Course } from 'services/models';
import { RegistrationNoticeAlert } from './RegistrationNoticeAlert';
import { InterviewsList } from './InterviewsList';
import { WaitListAlert } from './WaitListAlert';

export function InterviewDetails(props: {
  interviewTask: InterviewDto;
  course: Course;
  interviews: MentorInterview[];
  fetchStudentInterviews: () => Promise<void>;
}) {
  const { interviewTask, course, interviews, fetchStudentInterviews } = props;
  const { startDate } = interviewTask;

  const isRegistrationInProgress = isInterviewRegistrationInProgress(startDate);
  const interviewStarted = isInterviewStarted(startDate);

  return (
    <>
      {interviewStarted && (
        <WaitListAlert interviewId={interviewTask.id} startDate={startDate} courseAlias={course.alias} />
      )}
      {isRegistrationInProgress && <RegistrationNoticeAlert interview={interviewTask} startDate={startDate} />}
      {interviewStarted && (
        <InterviewsList
          fetchStudentInterviews={fetchStudentInterviews}
          interviews={interviews}
          course={course}
          interviewTask={interviewTask}
        />
      )}
    </>
  );
}
