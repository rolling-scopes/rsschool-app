import { GetServerSideProps } from 'next';
import { InterviewQuestionService } from 'services/interviewQuestion';

export const getServerSideProps: GetServerSideProps<any> = async ctx => {
  try {
    const interviewQuestionService = new InterviewQuestionService(ctx);
    const [questions] = await Promise.all([interviewQuestionService.getInterviewQuestions()]);
    return { props: { questions } };
  } catch (e) {
    return { props: { questions: [] } };
  }
};
