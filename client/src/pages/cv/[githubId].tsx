import withSession from 'components/withSession';
import { CVPage } from 'modules/Opportunities/pages/CVPage';

// force the page to render on the server to fix issue with getting githubId from url
export const getServerSideProps = async () => {
  return { props: {} };
};

export default withSession(CVPage);
