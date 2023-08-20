import { withSession } from 'components/withSession';
import { SessionAndCourseProvider } from 'modules/Course/contexts';
import { getServerSideProps } from 'modules/Home/data/getServerSideProps';
import { HomePage } from 'modules/Home/pages/HomePage';
import { CoursePageProps } from 'services/models';

export { getServerSideProps };

function Page(props: CoursePageProps) {
  return (
    <SessionAndCourseProvider>
      <HomePage {...props} />
    </SessionAndCourseProvider>
  );
}

export default withSession(Page);
