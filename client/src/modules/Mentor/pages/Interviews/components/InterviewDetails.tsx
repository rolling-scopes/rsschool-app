import { InterviewDto } from 'api';
import { isInterviewRegistrationInProgress, isInterviewStarted } from 'domain/interview';
import { MentorInterview } from 'services/course';
import { Course } from 'services/models';
import { RegistrationNoticeAlert } from './RegistrationNoticeAlert';
import { StudentsList } from './StudentsList';
import { WaitListAlert } from './WaitListAlert';

export function InterviewDetails(props: {
  interviewTask: InterviewDto;
  course: Course;
  students: MentorInterview[];
  fetchStudentInterviews: () => Promise<void>;
}) {
  const { interviewTask, course, students, fetchStudentInterviews } = props;
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
        <StudentsList
          fetchStudentInterviews={fetchStudentInterviews}
          interviews={students}
          course={course}
          interviewTask={interviewTask}
        />
      )}
    </>
  );
}
