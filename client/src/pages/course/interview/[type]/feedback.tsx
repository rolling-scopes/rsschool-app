import { CourseRole } from 'components/withSession';
import { SessionProvider } from 'modules/Course/contexts';
import { InterviewFeedback } from 'modules/Interviews/pages/InterviewFeedback';
import { getServerSideProps, PageProps } from 'modules/Interviews/pages/InterviewFeedback/getServerSideProps';

export { getServerSideProps };

export default function (props: PageProps) {
  return (
    <SessionProvider allowedRoles={[CourseRole.Mentor]} course={props.course}>
      <InterviewFeedback {...props} />
    </SessionProvider>
  );
}
