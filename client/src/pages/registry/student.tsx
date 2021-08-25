import { NextPageContext } from 'next';
import { withSession } from 'components/withSession';
import { StudentRegistry } from 'modules/Registry/pages/Student';
import { withGoogleMaps } from 'components/withGoogleMaps';

const StudentRegistryPage: any = withGoogleMaps(withSession(StudentRegistry));
StudentRegistryPage.getInitialProps = async (context: NextPageContext) => {
  try {
    const courseAlias = context.query.course;
    return { courseAlias };
  } catch (e) {
    console.error(e.message);
    return { courseAlias: undefined };
  }
};

export default StudentRegistryPage;
