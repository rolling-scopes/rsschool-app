import withCourseData from 'components/withCourseData';
import { CoursePageProps } from 'services/models';
import { SessionProvider } from 'modules/Course/contexts';
import { AutoTests } from 'modules/AutoTest/components';
import { CourseRole } from 'components/withSession';

function Page(props: CoursePageProps) {
  return (
    <SessionProvider allowedRoles={[CourseRole.Student]} course={props.course}>
      <AutoTests {...props} />
    </SessionProvider>
  );
}

export default withCourseData(Page);
