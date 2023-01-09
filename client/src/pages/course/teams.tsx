import { getCourseProps, noAccessResponse } from 'modules/Course/data/getCourseProps';
import withSession from 'components/withSession';
import { SessionProvider } from 'modules/Course/contexts';
import { CoursePageProps } from 'services/models';
import { GetServerSideProps } from 'next';
import { ProfileCourseDto, TeamDistributionApi } from 'api';
import { Teams } from 'modules/Teams';
import { getTokenFromContext } from 'utils/server';
import { getApiConfiguration } from 'utils/axios';

export interface TeamsPageProps extends CoursePageProps {
  teamDistributionId: string;
}

export const getServerSideProps: GetServerSideProps<{
  course: ProfileCourseDto;
  teamDistributionId: string;
}> = async ctx => {
  const courseProps = (await getCourseProps(ctx)) as any;

  if (!courseProps.props?.course) {
    return noAccessResponse;
  }
  const teamDistributionId = ctx.query.teamDistributionId;
  const token = getTokenFromContext(ctx);
  const teamDistributionApi = new TeamDistributionApi(getApiConfiguration(token));
  try {
    await teamDistributionApi.getCourseTeamDistributionDetailed(
      courseProps.props.course.id,
      Number(teamDistributionId),
    );
    return {
      props: { ...courseProps.props, teamDistributionId: teamDistributionId },
    };
  } catch (error) {
    return noAccessResponse;
  }
};

export function Page(props: TeamsPageProps) {
  return (
    <SessionProvider course={props.course}>
      <Teams {...props} />
    </SessionProvider>
  );
}

export default withSession(Page);
