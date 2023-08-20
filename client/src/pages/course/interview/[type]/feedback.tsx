import { SessionAndCourseProvider } from 'modules/Course/contexts';
import { InterviewFeedback } from 'modules/Interviews/pages/InterviewFeedback';
import { getServerSideProps, PageProps } from 'modules/Interviews/pages/InterviewFeedback/getServerSideProps';
import { CourseRole } from 'services/models';

export { getServerSideProps };

export default function (props: PageProps) {
  return (
    <SessionAndCourseProvider allowedRoles={[CourseRole.Mentor]} course={props.course}>
      <InterviewFeedback {...props} />
    </SessionAndCourseProvider>
  );
}
