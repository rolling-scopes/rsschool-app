import { getCourseProps as getServerSideProps } from 'modules/Course/data/getCourseProps';
import withSession from 'components/withSession';
import { SessionProvider } from 'modules/Course/contexts';
import { TeamDistributions } from 'modules/TeamDistribution/pages/TeamDistributions';
import { CoursePageProps } from 'services/models';

export { getServerSideProps };

function Page(props: CoursePageProps) {
  return (
    <SessionProvider course={props.course}>
      <TeamDistributions {...props} />
    </SessionProvider>
  );
}

export default withSession(Page);
