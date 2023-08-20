import withCourseData from 'components/withCourseData';
import withSession from 'components/withSession';
import { CoursePageProps, CourseRole } from 'services/models';
import { CrossCheckSubmit } from 'modules/Course/pages/Student/CrossCheckSubmit';
import { DefaultPageProvider } from 'modules/Course/contexts';

function Page(props: CoursePageProps) {
  return (
    <DefaultPageProvider course={props.course}>
      <CrossCheckSubmit {...props} />
    </DefaultPageProvider>
  );
}

export default withCourseData(withSession(Page, { requiredCourseRole: CourseRole.Student }));
