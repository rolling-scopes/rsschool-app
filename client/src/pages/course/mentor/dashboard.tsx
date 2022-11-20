import withSession, { CourseRole } from 'components/withSession';
import { SessionProvider } from 'modules/Course/contexts';
import { MentorDashboard } from 'modules/Mentor/components';
import { getMentorProps as getServerSideProps, MentorDashboardProps } from 'modules/Course/data';

export { getServerSideProps };

function Page(props: MentorDashboardProps) {
  return (
    <SessionProvider allowedRoles={[CourseRole.Mentor]} course={props.course}>
      <MentorDashboard {...props} />
    </SessionProvider>
  );
}

export default withSession(Page);
