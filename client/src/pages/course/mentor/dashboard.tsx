import withSession, { CourseRole } from 'components/withSession';
import { SessionProvider } from 'modules/Course/contexts';
import { MentorDashboard } from 'modules/Mentor/components';
import { CoursePageProps } from 'services/models';
import { getCourseProps as getServerSideProps } from 'modules/Course/data';

export { getServerSideProps };

function Page(props: CoursePageProps) {
  return (
    <SessionProvider allowedRoles={[CourseRole.Mentor]} course={props.course}>
      <MentorDashboard {...props} />
    </SessionProvider>
  );
}

export default withSession(Page);
