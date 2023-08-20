import { getCourseProps, noAccessResponse } from 'modules/Course/data/getCourseProps';
import { AutoTestTaskProps, Task } from 'modules/AutoTest/pages';
import { GetServerSideProps } from 'next';
import { CoursesTasksApi } from 'api';
import { getApiConfiguration } from 'utils/axios';
import { getTokenFromContext } from 'utils/server';
import { DefaultPageProvider } from 'modules/Course/contexts';

function Page(props: AutoTestTaskProps) {
  return (
    <DefaultPageProvider course={props.course}>
      <Task {...props} />
    </DefaultPageProvider>
  );
}

export const getServerSideProps: GetServerSideProps<AutoTestTaskProps> = async ctx => {
  const courseTaskId = ctx.query.courseTaskId;
  const token = getTokenFromContext(ctx);
  const result = (await getCourseProps(ctx)) as any;

  if (!result.props) {
    return noAccessResponse;
  }

  try {
    const course = result.props.course;
    if (course) {
      const { data: task } = await new CoursesTasksApi(getApiConfiguration(token)).getCourseTask(
        course.id,
        Number(courseTaskId),
      );

      return {
        props: { course, task },
      };
    }

    return noAccessResponse;
  } catch (error) {
    return noAccessResponse;
  }
};

function PageWithSession(props: AutoTestTaskProps) {
  return (
    <DefaultPageProvider course={props.course}>
      <Page {...props} />
    </DefaultPageProvider>
  );
}

export default PageWithSession;
