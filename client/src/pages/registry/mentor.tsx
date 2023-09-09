import { withGoogleMaps } from 'components/withGoogleMaps';
import { SessionProvider } from 'modules/Course/contexts';
import { MentorRegistry } from 'modules/Registry/pages';
import { NextPageContext } from 'next';

function Page(props: { courseAlias?: string }) {
  return (
    <SessionProvider>
      <MentorRegistry {...props} />
    </SessionProvider>
  );
}

const MentorRegistryPage: any = withGoogleMaps(Page);
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
