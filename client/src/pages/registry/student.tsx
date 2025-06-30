import { NextPageContext, NextPage } from 'next';
import { StudentRegistry } from 'modules/Registry/pages';
import { withGoogleMaps } from 'components/withGoogleMaps';
import { SessionProvider } from 'modules/Course/contexts';

function Page(props: { courseAlias?: string }) {
  return (
    <SessionProvider>
      <StudentRegistry {...props} />
    </SessionProvider>
  );
}

const StudentRegistryPage: NextPage<{ courseAlias?: string }> = withGoogleMaps(Page);
StudentRegistryPage.getInitialProps = async (context: NextPageContext) => {
  try {
    const courseAlias = Array.isArray(context.query.course) ? context.query.course[0] : context.query.course;
    return { courseAlias };
  } catch (err) {
    const error = err as Error;
    console.error(error.message);
    return { courseAlias: undefined };
  }
};

export default StudentRegistryPage;
