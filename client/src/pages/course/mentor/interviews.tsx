import withCourseData from 'components/withCourseData';
import withSession from 'components/withSession';
import { DefaultPageProvider } from 'modules/Course/contexts';
import { Interviews } from 'modules/Mentor/pages/Interviews';
import { CoursePageProps, CourseRole } from 'services/models';

function Page(props: CoursePageProps) {
  return (
    <DefaultPageProvider allowedRoles={[CourseRole.Mentor]} course={props.course}>
      <Interviews {...props} />
    </DefaultPageProvider>
  );
}

export default withCourseData(withSession(Page));
