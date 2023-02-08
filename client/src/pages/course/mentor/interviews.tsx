import withCourseData from 'components/withCourseData';
import withSession from 'components/withSession';
import { Interviews } from 'modules/Mentor/pages/Interviews';

export default withCourseData(withSession(Interviews));
