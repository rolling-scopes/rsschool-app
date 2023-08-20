import withCourseData from 'components/withCourseData';
import withSession from 'components/withSession';
import { SessionAndCourseProvider } from 'modules/Course/contexts';
import { Interviews } from 'modules/Mentor/pages/Interviews';
import { CoursePageProps, CourseRole } from 'services/models';

function Page(props: CoursePageProps) {
  return (
    <SessionAndCourseProvider allowedRoles={[CourseRole.Mentor]} course={props.course}>
      <Interviews {...props} />
    </SessionAndCourseProvider>
  );
}

export default withCourseData(withSession(Page));
