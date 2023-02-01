import withCourseData from 'components/withCourseData';
import withSession from 'components/withSession';
import { CourseRole } from 'services/models';
import { CrossCheckSubmit } from 'modules/Course/pages/Student/CrossCheckSubmit';

export default withCourseData(withSession(CrossCheckSubmit, CourseRole.Student));
