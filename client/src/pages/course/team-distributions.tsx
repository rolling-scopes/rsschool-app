import { getCourseProps as getServerSideProps } from 'modules/Course/data/getCourseProps';
import withSession from 'components/withSession';
import { TeamDistributions } from 'modules/TeamDistribution/pages/TeamDistributions';
import { DefaultPageProvider } from 'modules/Course/contexts';
import { TeamsPageProps } from './teams';

export { getServerSideProps };

function Page(props: TeamsPageProps) {
  return (
    <DefaultPageProvider course={props.course}>
      <TeamDistributions {...props} />
    </DefaultPageProvider>
  );
}

export default withSession(Page);
