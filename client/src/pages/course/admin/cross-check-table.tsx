import withCourseData from 'components/withCourseData';
import withSession from 'components/withSession';
import { DefaultPageProvider } from 'modules/Course/contexts';
import { CrossCheckPairs } from 'modules/CrossCheckPairs/pages/CrossCheckPairs';
import { CoursePageProps } from 'services/models';

function Page(props: CoursePageProps) {
  return (
    <DefaultPageProvider course={props.course}>
      <CrossCheckPairs {...props} />
    </DefaultPageProvider>
  );
}

export default withCourseData(withSession(Page));
