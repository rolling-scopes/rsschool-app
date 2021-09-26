import { withSession } from 'components';
import { getServerSideProps } from 'modules/TechnicalInterviews/data/getServerSideProps';
import { InterviewTemplatePage } from 'modules/TechnicalInterviews/pages/InterviewTemplatePage';

export { getServerSideProps };
export default withSession(InterviewTemplatePage);
