import { CourseRole } from 'components/withSession';
import { SessionProvider } from 'modules/Course/contexts';
import { getCourseProps as getServerSideProps, PageProps } from 'modules/Course/data/getCourseProps';
import { Students } from 'modules/Mentor/pages/Students';

export { getServerSideProps };

export default function (props: PageProps) {
  return (
    <SessionProvider allowedRoles={[CourseRole.Mentor]} course={props.course}>
      <Students {...props} />
    </SessionProvider>
  );
}
