import withCourseData from 'components/withCourseData';
import withSession from 'components/withSession';
import { CrossCheckPairsTable } from 'modules/CrossCheckPairsTable/pages/CrossCheckPairsTable';


export default withCourseData(withSession(CrossCheckPairsTable));
