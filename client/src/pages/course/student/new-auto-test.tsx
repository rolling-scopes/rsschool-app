import { SessionProvider } from 'modules/Course/contexts';
import { AutoTests } from 'modules/AutoTest/components';
import { CourseRole } from 'components/withSession';
import { GetServerSideProps } from 'next';
import { CoursesTasksApi, CourseTaskDtoTypeEnum, CreateCourseTaskDtoCheckerEnum, ProfileCourseDto } from 'api';
import { getTokenFromContext } from 'utils/server';
import { noAccessResponse, notAuthorizedResponse } from 'modules/Course/data';
import { UserService } from 'services/user';
import { getApiConfiguration } from 'utils/axios';
import { AutoTestsProps } from '../../../modules/AutoTest/components/AutoTests/AutoTests';

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
    const { data: tasks } = await new CoursesTasksApi(getApiConfiguration(token)).getCourseTasksDetailed(courseId);

    const courseTasks = tasks.filter(
      task => task.checker === CreateCourseTaskDtoCheckerEnum.AutoTest && task.type !== CourseTaskDtoTypeEnum.Test,
    );

    return {
      props: { course, courseTasks },
    };
  } catch (e) {
    return noAccessResponse;
  }
};

function Page(props: AutoTestsProps) {
  return (
    <SessionProvider allowedRoles={[CourseRole.Student]} course={props.course}>
      <AutoTests {...props} />
    </SessionProvider>
  );
}

export default Page;
