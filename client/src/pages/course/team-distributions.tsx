import { ProfileCourseDto } from 'api';
import withSession from 'components/withSession';
import { SessionProvider } from 'modules/Course/contexts';
import { noAccessResponse, notAuthorizedResponse } from 'modules/Course/data';
import { TeamDistributions } from 'modules/TeamDistribution/pages/TeamDistributions';
import { GetServerSideProps } from 'next';
import { CoursePageProps } from 'services/models';
import { UserService } from 'services/user';
import { getTokenFromContext } from 'utils/server';

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

    return {
      props: { course },
    };
  } catch (e) {
    return noAccessResponse;
  }
};

function Page(props: CoursePageProps) {
  return (
    <SessionProvider course={props.course}>
      <TeamDistributions {...props} />
    </SessionProvider>
  );
}

export default withSession(Page);
