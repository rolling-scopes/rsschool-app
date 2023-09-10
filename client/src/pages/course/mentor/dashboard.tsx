import { CourseRole } from 'services/models';
import { ActiveCourseProvider, SessionProvider } from 'modules/Course/contexts';
import { MentorDashboard } from 'modules/Mentor/components';
import { GetServerSideProps } from 'next';
import { MentorsApi, ProfileCourseDto } from 'api';
import { getTokenFromContext } from 'utils/server';
import { noAccessResponse, notAuthorizedResponse } from 'modules/Course/data';
import { UserService } from 'services/user';
import { Session } from 'components/withSession';
import { CoursePageProps } from 'services/models';
import { getApiConfiguration } from 'utils/axios';

export interface MentorDashboardProps extends CoursePageProps {
  mentorId: number;
  studentsCount: number;
}

function parseToken(token: string): Session {
  return JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString()) as Session;
}

export const getServerSideProps: GetServerSideProps<{ course: ProfileCourseDto }> = async ctx => {
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
    const session = parseToken(token);
    const { mentorId } = session.courses[courseId] || {};

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

export default function (props: MentorDashboardProps) {
  return (
    <ActiveCourseProvider>
      <SessionProvider allowedRoles={[CourseRole.Mentor]} course={props.course}>
        <MentorDashboard {...props} />
      </SessionProvider>
    </ActiveCourseProvider>
  );
}
