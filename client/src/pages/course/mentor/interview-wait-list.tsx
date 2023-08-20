import withSession from 'components/withSession';
import { SessionAndCourseProvider } from 'modules/Course/contexts';
import { InterviewWaitingList, PageProps } from 'modules/Mentor/pages/InterviewWaitingList';
import { getServerSideProps } from 'modules/Mentor/pages/InterviewWaitingList/getServerSideProps';
import { CourseRole } from 'services/models';

export { getServerSideProps };

function Page(props: PageProps) {
  return (
    <SessionAndCourseProvider allowedRoles={[CourseRole.Mentor]}>
      <InterviewWaitingList {...props} />
    </SessionAndCourseProvider>
  );
}

export default withSession(Page);
