import withCourseData from 'components/withCourseData';
import withSession from 'components/withSession';
import { CoursePageProps, CourseRole } from 'services/models';
import { CrossCheckSubmit } from 'modules/Course/pages/Student/CrossCheckSubmit';
import { SessionAndCourseProvider } from 'modules/Course/contexts';

function Page(props: CoursePageProps) {
  return (
    <SessionAndCourseProvider course={props.course}>
      <CrossCheckSubmit {...props} />
    </SessionAndCourseProvider>
  );
}

export default withCourseData(withSession(Page, { requiredCourseRole: CourseRole.Student }));
