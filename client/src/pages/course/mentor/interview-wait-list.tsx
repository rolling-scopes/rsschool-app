import { ActiveCourseProvider, SessionProvider } from 'modules/Course/contexts';
import { InterviewWaitingList, PageProps } from 'modules/Mentor/pages/InterviewWaitingList';
import { getServerSideProps } from 'modules/Mentor/pages/InterviewWaitingList/getServerSideProps';
import { CourseRole } from 'services/models';

export { getServerSideProps };

function Page(props: PageProps) {
  return (
    <ActiveCourseProvider>
      <SessionProvider allowedRoles={[CourseRole.Mentor, CourseRole.Manager]}>
        <InterviewWaitingList {...props} />
      </SessionProvider>
    </ActiveCourseProvider>
  );
}

export default Page;
