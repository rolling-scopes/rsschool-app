import { withSession } from 'components/withSession';
import { SessionAndCourseProvider } from 'modules/Course/contexts';
import { getCourseProps as getServerSideProps } from 'modules/Course/data/getCourseProps';
import { ScorePage } from 'modules/Score/pages/ScorePage';
import { CoursePageProps } from 'services/models';

export { getServerSideProps };

function Page(props: CoursePageProps) {
  return (
    <SessionAndCourseProvider course={props.course}>
      <ScorePage {...props} />
    </SessionAndCourseProvider>
  );
}

export default withSession(Page);
