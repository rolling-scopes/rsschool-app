import { withGoogleMaps } from 'components/withGoogleMaps';
import { Session, withSession } from 'components/withSession';
import { DefaultPageProvider } from 'modules/Course/contexts';
import { MentorRegistry } from 'modules/Registry/pages';
import { NextPageContext } from 'next';

type Props = {
  session: Session;
  courseAlias?: string;
};

function Page(props: Props) {
  return (
    <DefaultPageProvider>
      <MentorRegistry {...props} />
    </DefaultPageProvider>
  );
}

const MentorRegistryPage: any = withGoogleMaps(withSession(Page));

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
