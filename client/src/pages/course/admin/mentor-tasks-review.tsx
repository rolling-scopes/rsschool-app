import { ActiveCourseProvider, SessionProvider } from 'modules/Course/contexts';
import { MentorTasksReview } from 'modules/MetorTasksReview/pages/MentorTasksReview';
import { CourseRole } from 'services/models';

export default function () {
  return (
    <ActiveCourseProvider>
      <SessionProvider allowedRoles={[CourseRole.Manager, CourseRole.Dementor]}>
        <MentorTasksReview />
      </SessionProvider>
    </ActiveCourseProvider>
  );
}
