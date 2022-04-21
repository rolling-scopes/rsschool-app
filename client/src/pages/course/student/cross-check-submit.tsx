import withCourseData from 'components/withCourseData';
import withSession, { CourseRole } from 'components/withSession';
import { CrossCheckSubmit } from 'modules/Course/pages/Student/CrossCheckSubmit';

export default withCourseData(withSession(CrossCheckSubmit, CourseRole.Student));
