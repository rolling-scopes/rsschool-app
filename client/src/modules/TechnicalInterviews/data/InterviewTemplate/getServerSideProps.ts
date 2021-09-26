import { GetServerSideProps } from 'next';
import { InterviewQuestionCategoryService, InterviewQuestionService } from 'services/interviewQuestion';

export const getServerSideProps: GetServerSideProps<any> = async ctx => {
  try {
    const interviewQuestionService = new InterviewQuestionService(ctx);
    const interviewQuestionCategoryService = new InterviewQuestionCategoryService(ctx);
    const [interviewQuestions, interviewCategories] = await Promise.all([
      interviewQuestionService.getInterviewQuestions(),
      interviewQuestionCategoryService.getInterviewQuestionCategories(),
    ]);
    return { props: { interviewQuestions, interviewCategories } };
  } catch (e) {
    return { props: { interviewQuestions: [], interviewCategories: [] } };
  }
};
