import { InterviewDto } from 'api';
import { isInterviewRegistrationInProgess, isInterviewStarted } from 'domain/interview';
import { MentorInterview } from 'services/course';
import { Course } from 'services/models';
import { RegistrationNoticeAlert } from './RegistrationNoticeAlert';
import { StudentsList } from './StudentsList';
import { WaitListAlert } from './WaitListAlert';

export function InterviewDetails(props: {
  interview: InterviewDto;
  course: Course;
  students: MentorInterview[];
  fetchStudentInterviews: () => Promise<void>;
}) {
  const { interview, course, students, fetchStudentInterviews } = props;
  const { startDate } = interview;

  const isRegistrationInProgress = isInterviewRegistrationInProgess(startDate);
  const interviewStarted = isInterviewStarted(startDate);

  return (
    <>
      {interviewStarted && (
        <WaitListAlert interviewId={interview.id} startDate={startDate} courseAlias={course.alias} />
      )}
      {isRegistrationInProgress && <RegistrationNoticeAlert interview={interview} startDate={startDate} />}
      {interviewStarted && (
        <StudentsList
          fetchStudentInterviews={fetchStudentInterviews}
          interviews={students}
          course={course}
          interview={interview}
        />
      )}
    </>
  );
}
