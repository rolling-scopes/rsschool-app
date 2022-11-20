import { GetServerSideProps } from 'next';
import { MentorsApi, ProfileCourseDto } from 'api';
import { getTokenFromContext } from 'utils/server';
import { noAccessResponse, notAuthorizedResponse } from '.';
import { UserService } from 'services/user';
import { Session } from 'components/withSession';
import { CoursePageProps } from 'services/models';
import { getApiConfiguration } from 'utils/axios';

export interface MentorDashboardProps extends CoursePageProps {
  mentorId: number;
  studentsCount: number;
}

export const getMentorProps: GetServerSideProps<{ course: ProfileCourseDto }> = async ctx => {
  try {
    const alias = ctx.query.course as string;
    const token = getTokenFromContext(ctx);

    if (token == null) {
      return noAccessResponse;
    }

    const courses = await new UserService(token).getCourses();
    const course = courses.find(course => course.alias === alias) ?? null;

    if (course == null) {
      return notAuthorizedResponse;
    }

    const courseId = course.id;
    const userData: Session = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
    const mentorId = userData.courses[courseId]?.mentorId;

    if (!mentorId) {
      return notAuthorizedResponse;
    }

    const service = new MentorsApi(getApiConfiguration(token));
    const { data: studentsCount } = await service.getCourseStudentsCount(mentorId, courseId);

    return {
      props: { course, mentorId, studentsCount },
    };
  } catch (e) {
    return noAccessResponse;
  }
};
