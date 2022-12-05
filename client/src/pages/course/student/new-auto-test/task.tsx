import { SessionProvider } from 'modules/Course/contexts';
import { CourseRole } from 'components/withSession';
import { getCourseProps as getServerSideProps } from 'modules/Course/data/getCourseProps';
import { CoursePageProps } from 'services/models';
import {Task} from 'modules/AutoTest/pages';

function Page(props: CoursePageProps) {
  return (
    <SessionProvider allowedRoles={[CourseRole.Student]} course={props.course}>
      <Task {...props} />
    </SessionProvider>
  );
}

export { getServerSideProps };

export default Page;
