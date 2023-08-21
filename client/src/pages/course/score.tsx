import { withSession } from 'components/withSession';
import { SessionProvider } from 'modules/Course/contexts';
import { getCourseProps as getServerSideProps } from 'modules/Course/data/getCourseProps';
import { ScorePage } from 'modules/Score/pages/ScorePage';
import { CoursePageProps } from 'services/models';

export { getServerSideProps };

function Page(props: CoursePageProps) {
  return (
    <SessionProvider course={props.course}>
      <ScorePage {...props} />
    </SessionProvider>
  );
}

export default withSession(Page);
