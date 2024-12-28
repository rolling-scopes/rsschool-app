import { getCourseProps, noAccessResponse } from 'modules/Course/data/getCourseProps';
import { ActiveCourseProvider, SessionProvider } from 'modules/Course/contexts';
import { Course } from 'services/models';
import { GetServerSideProps } from 'next';
import { ProfileCourseDto, TeamDistributionApi, TeamDistributionDetailedDto } from 'api';
import { Teams } from 'modules/Teams';
import { getTokenFromContext } from 'utils/server';
import { getApiConfiguration } from 'utils/axios';

export interface TeamsPageProps {
  teamDistributionDetailed: TeamDistributionDetailedDto;
  course: Course;
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
  } catch {
    return noAccessResponse;
  }
};

export function Page(props: TeamsPageProps) {
  return (
    <SessionProvider course={props.course}>
      <ActiveCourseProvider>
        <Teams {...props} />
      </ActiveCourseProvider>
    </SessionProvider>
  );
}

export default Page;
