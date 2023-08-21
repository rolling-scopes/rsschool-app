import withCourseData from 'components/withCourseData';
import withSession from 'components/withSession';
import { SessionProvider } from 'modules/Course/contexts';
import { CrossCheckPairs } from 'modules/CrossCheckPairs/pages/CrossCheckPairs';
import { CoursePageProps } from 'services/models';

function Page(props: CoursePageProps) {
  return (
    <SessionProvider course={props.course}>
      <CrossCheckPairs {...props} />
    </SessionProvider>
  );
}

export default withCourseData(withSession(Page));
