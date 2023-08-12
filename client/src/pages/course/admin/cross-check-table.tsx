import withCourseData from 'components/withCourseData';
import withSession from 'components/withSession';
import { CrossCheckPairs } from 'modules/CrossCheckPairs/pages/CrossCheckPairs';

export default withCourseData(withSession(CrossCheckPairs));
