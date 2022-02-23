import withSession from 'components/withSession';
import { EditPage } from 'modules/Opportunities/pages/EditPage';

// force the page to render on the server to fix issue with getting githubId from url
export const getServerSideProps = async () => {
  return { props: {} };
};

export default withSession(EditPage);
