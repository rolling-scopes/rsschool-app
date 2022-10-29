import withSession, { CourseRole } from 'components/withSession';
import { SessionProvider } from 'modules/Course/contexts';
import { MentorDashboard } from 'modules/Mentor/components/MentorDashboard';
import withCourseData from 'components/withCourseData';
import { CoursePageProps } from 'services/models';

function Page(props: CoursePageProps) {
  return (
    <SessionProvider allowedRoles={[CourseRole.Mentor]} course={props.course}>
      <MentorDashboard {...props} />
    </SessionProvider>
  );
}

export default withCourseData(withSession(Page));
