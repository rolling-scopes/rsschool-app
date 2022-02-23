import withSession from 'components/withSession';
import { ResumePage } from 'modules/Opportunities/pages/ResumePage';

// force the page to render on the server to fix issue with getting githubId from url
export const getServerSideProps = async () => {
  return { props: {} };
};

export default withSession(ResumePage);
