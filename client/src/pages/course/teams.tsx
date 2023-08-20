import { getCourseProps, noAccessResponse } from 'modules/Course/data/getCourseProps';
import withSession from 'components/withSession';
import { CoursePageProps } from 'services/models';
import { GetServerSideProps } from 'next';
import { ProfileCourseDto, TeamDistributionApi, TeamDistributionDetailedDto } from 'api';
import { Teams } from 'modules/Teams';
import { getTokenFromContext } from 'utils/server';
import { getApiConfiguration } from 'utils/axios';
import { DefaultPageProvider } from 'modules/Course/contexts';

export interface TeamsPageProps extends CoursePageProps {
  teamDistributionDetailed: TeamDistributionDetailedDto;
}

export const getServerSideProps: GetServerSideProps<{
  course: ProfileCourseDto;
  teamDistributionDetailed: TeamDistributionDetailedDto;
}> = async ctx => {
  const courseProps = (await getCourseProps(ctx)) as { props?: { course: ProfileCourseDto } };

  if (!courseProps.props?.course) {
    return noAccessResponse;
  }
  const teamDistributionId = ctx.query.teamDistributionId;
  const token = getTokenFromContext(ctx);
  const teamDistributionApi = new TeamDistributionApi(getApiConfiguration(token));
  try {
    const { data } = await teamDistributionApi.getCourseTeamDistributionDetailed(
      courseProps.props.course.id,
      Number(teamDistributionId),
    );
    return {
      props: { ...courseProps.props, teamDistributionDetailed: data },
    };
  } catch (error) {
    return noAccessResponse;
  }
};

function Page(props: TeamsPageProps) {
  return (
    <DefaultPageProvider course={props.course}>
      <Teams {...props} />
    </DefaultPageProvider>
  );
}

export default withSession(Page);
