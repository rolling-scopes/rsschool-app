import { GetServerSideProps } from 'next';
import { InterviewQuestionCategoryService, InterviewQuestionService } from 'services/interviewQuestion';
import { getTokenFromContext } from 'utils/server';

export const getServerSideProps: GetServerSideProps<any> = async ctx => {
  try {
    const token = getTokenFromContext(ctx);
    const interviewQuestionService = new InterviewQuestionService(token);
    const interviewQuestionCategoryService = new InterviewQuestionCategoryService(token);
    const [questions, categories] = await Promise.all([
      interviewQuestionService.getInterviewQuestions(),
      interviewQuestionCategoryService.getInterviewQuestionCategories(),
    ]);
    return { props: { questions, categories } };
  } catch (e) {
    return { props: { questions: [], categories: [] } };
  }
};
