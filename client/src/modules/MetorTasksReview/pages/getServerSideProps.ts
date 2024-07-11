import { CourseTaskDto, CourseTaskDtoCheckerEnum, CoursesTasksApi } from 'api';
import { notAuthorizedResponse } from 'modules/Course/data';
import { GetServerSideProps } from 'next';
import type { CourseOnlyPageProps } from 'services/models';
import { UserService } from 'services/user';
import { getApiConfiguration } from 'utils/axios';
import { getTokenFromContext } from 'utils/server';

export type PageProps = CourseOnlyPageProps & {
  tasks: CourseTaskDto[];
};

export const getServerSideProps: GetServerSideProps<PageProps> = async ctx => {
  try {
    const alias = ctx.query.course as string;

    const token = getTokenFromContext(ctx);
    const courses = await new UserService(token).getCourses();
    const course = courses.find(course => course.alias === alias) ?? null;

    if (!course) {
      return notAuthorizedResponse;
    }

    const coursesTasksApi = new CoursesTasksApi(getApiConfiguration(token));
    const tasks = await coursesTasksApi.getCourseTasks(course.id, undefined, CourseTaskDtoCheckerEnum.Mentor);

    const props: PageProps = {
      tasks: tasks.data,
      course,
    };

    return {
      props: props,
    };
  } catch (e) {
    return notAuthorizedResponse;
  }
};
