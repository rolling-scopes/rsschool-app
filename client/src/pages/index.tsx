import { withSession } from 'components/withSession';
import { DefaultPageProvider } from 'modules/Course/contexts';
import { getServerSideProps } from 'modules/Home/data/getServerSideProps';
import { HomePage } from 'modules/Home/pages/HomePage';
import { CoursePageProps } from 'services/models';

export { getServerSideProps };

function Page(props: CoursePageProps) {
  return (
    <DefaultPageProvider>
      <HomePage {...props} />
    </DefaultPageProvider>
  );
}

export default withSession(Page);
