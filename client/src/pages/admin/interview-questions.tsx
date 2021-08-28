import { withSession } from 'components';
import { getServerSideProps } from 'modules/InterviewQuestions/data/getServerSideProps';
import { InterviewQuestionsPage } from 'modules/InterviewQuestions/pages/InterviewQuestionsPage';

export { getServerSideProps };
export default withSession(InterviewQuestionsPage);
