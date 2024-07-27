import { ActiveCourseProvider, SessionProvider } from 'modules/Course/contexts';
import { MentorTasksReview } from 'modules/MentorTasksReview/pages/MentorTasksReview';
import { getServerSideProps, PageProps } from 'modules/MentorTasksReview/pages/getServerSideProps';
import { CourseRole } from 'services/models';

export { getServerSideProps };

export default function (props: PageProps) {
  return (
    <ActiveCourseProvider>
      <SessionProvider allowedRoles={[CourseRole.Manager, CourseRole.Dementor]}>
        <MentorTasksReview {...props} />
      </SessionProvider>
    </ActiveCourseProvider>
  );
}
