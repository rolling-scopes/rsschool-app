import { withGoogleMaps } from 'components/withGoogleMaps';
import { withSession } from 'components/withSession';
import { MentorRegistry } from 'modules/Registry/pages/Mentor';
import { NextPageContext } from 'next';

const MentorRegistryPage: any = withGoogleMaps(withSession(MentorRegistry));
MentorRegistryPage.getInitialProps = async (context: NextPageContext) => {
  try {
    const courseAlias = context.query.course;
    return { courseAlias };
  } catch (err) {
    const error = err as Error;
    console.error(error?.message);
    return { courseAlias: undefined };
  }
};

export default MentorRegistryPage;
