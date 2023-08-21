import { getCourseProps as getServerSideProps } from 'modules/Course/data/getCourseProps';
import withSession from 'components/withSession';
import { TeamDistributions } from 'modules/TeamDistribution/pages/TeamDistributions';
import { SessionProvider } from 'modules/Course/contexts';
import { TeamsPageProps } from './teams';

export { getServerSideProps };

function Page(props: TeamsPageProps) {
  return (
    <SessionProvider course={props.course}>
      <TeamDistributions {...props} />
    </SessionProvider>
  );
}

export default withSession(Page);
