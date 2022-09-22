import withSession from 'components/withSession';
import { InterviewWaitingList } from 'modules/Interviews/pages/InterviewWaitingList';
import { getServerSideProps } from 'modules/Interviews/pages/InterviewWaitingList/getServerSideProps';

export { getServerSideProps };

export default withSession(InterviewWaitingList);
