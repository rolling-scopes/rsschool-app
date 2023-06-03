import withSession from 'components/withSession';
import { InterviewWaitingList } from 'modules/Mentor/pages/InterviewWaitingList';
import { getServerSideProps } from 'modules/Mentor/pages/InterviewWaitingList/getServerSideProps';

export { getServerSideProps };

export default withSession(InterviewWaitingList);
