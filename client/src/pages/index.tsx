import { withSession } from 'components/withSession';
import { SessionProvider } from 'modules/Course/contexts';
import { getServerSideProps } from 'modules/Home/data/getServerSideProps';
import { HomePage } from 'modules/Home/pages/HomePage';
import { CoursePageProps } from 'services/models';

export { getServerSideProps };

function Page(props: CoursePageProps) {
  return (
    <SessionProvider>
      <HomePage {...props} />
    </SessionProvider>
  );
}

export default withSession(Page);
