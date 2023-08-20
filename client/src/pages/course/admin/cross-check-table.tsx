import withCourseData from 'components/withCourseData';
import withSession from 'components/withSession';
import { SessionAndCourseProvider } from 'modules/Course/contexts';
import { CrossCheckPairs } from 'modules/CrossCheckPairs/pages/CrossCheckPairs';
import { CoursePageProps } from 'services/models';

function Page(props: CoursePageProps) {
  return (
    <SessionAndCourseProvider course={props.course}>
      <CrossCheckPairs {...props} />
    </SessionAndCourseProvider>
  );
}

export default withCourseData(withSession(Page));
