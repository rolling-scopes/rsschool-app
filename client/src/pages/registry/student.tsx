import { NextPageContext } from 'next';
import { Session, withSession } from 'components/withSession';
import { StudentRegistry } from 'modules/Registry/pages';
import { withGoogleMaps } from 'components/withGoogleMaps';
import { DefaultPageProvider } from 'modules/Course/contexts';

type Props = {
  session: Session;
  courseAlias?: string;
};

function Page(props: Props) {
  return (
    <DefaultPageProvider>
      <StudentRegistry {...props} />
    </DefaultPageProvider>
  );
}

const StudentRegistryPage: any = withGoogleMaps(withSession(Page));

StudentRegistryPage.getInitialProps = async (context: NextPageContext) => {
  try {
    const courseAlias = context.query.course;
    return { courseAlias };
  } catch (err) {
    const error = err as Error;
    console.error(error.message);
    return { courseAlias: undefined };
  }
};

export default StudentRegistryPage;
