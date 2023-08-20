import { CourseRole } from 'services/models';
import { DefaultPageProvider } from 'modules/Course/contexts';
import { getCourseProps } from 'modules/Course/data';
import { StudentFeedback } from 'modules/Mentor/pages/StudentFeedback';
import type { CourseOnlyPageProps } from 'services/models';

export const getServerSideProps = getCourseProps;

export default function (props: CourseOnlyPageProps) {
  return (
    <DefaultPageProvider allowedRoles={[CourseRole.Mentor]} course={props.course}>
      <StudentFeedback {...props} />
    </DefaultPageProvider>
  );
}
