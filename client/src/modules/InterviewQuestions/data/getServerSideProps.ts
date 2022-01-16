import { GetServerSideProps } from 'next';
import { InterviewQuestionCategoryService, InterviewQuestionService } from 'services/interviewQuestion';

export const getServerSideProps: GetServerSideProps<any> = async ctx => {
  try {
    const interviewQuestionService = new InterviewQuestionService(ctx);
    const interviewQuestionCategoryService = new InterviewQuestionCategoryService(ctx);
    const [questions, categories] = await Promise.all([
      interviewQuestionService.getInterviewQuestions(),
      interviewQuestionCategoryService.getInterviewQuestionCategories(),
    ]);
    return { props: { questions, categories } };
  } catch (e) {
    return { props: { questions: [], categories: [] } };
  }
};
