import withCourseData from 'components/withCourseData';
import withSession from 'components/withSession';
import { SessionProvider } from 'modules/Course/contexts';
import { Interviews } from 'modules/Mentor/pages/Interviews';
import { CoursePageProps, CourseRole } from 'services/models';

function Page(props: CoursePageProps) {
  return (
    <SessionProvider allowedRoles={[CourseRole.Mentor]} course={props.course}>
      <Interviews {...props} />
    </SessionProvider>
  );
}

export default withCourseData(withSession(Page));
