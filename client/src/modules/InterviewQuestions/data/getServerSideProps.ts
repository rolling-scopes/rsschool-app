import { GetServerSideProps } from 'next';
import { CoursesService } from 'services/courses';
import { InterviewQuestionCategoryService, InterviewQuestionService } from 'services/interviewQuestion';
import { getTokenFromContext } from 'utils/server';

export const getServerSideProps: GetServerSideProps<any> = async ctx => {
  try {
    const token = getTokenFromContext(ctx);
    const interviewQuestionService = new InterviewQuestionService(token);
    const interviewQuestionCategoryService = new InterviewQuestionCategoryService(token);
    const courseService = new CoursesService(token);
    const [questions, categories, courses] = await Promise.all([
      interviewQuestionService.getInterviewQuestions(),
      interviewQuestionCategoryService.getInterviewQuestionCategories(),
      courseService.getCourses(),
    ]);
    return { props: { questions, categories, courses } };
  } catch (e) {
    return { props: { questions: [], categories: [], courses: [] } };
  }
};
