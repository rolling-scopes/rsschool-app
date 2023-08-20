import { getCourseProps as getServerSideProps } from 'modules/Course/data/getCourseProps';
import withSession from 'components/withSession';
import { TeamDistributions } from 'modules/TeamDistribution/pages/TeamDistributions';
import { SessionAndCourseProvider } from 'modules/Course/contexts';
import { TeamsPageProps } from './teams';

export { getServerSideProps };

function Page(props: TeamsPageProps) {
  return (
    <SessionAndCourseProvider course={props.course}>
      <TeamDistributions {...props} />
    </SessionAndCourseProvider>
  );
}

export default withSession(Page);
