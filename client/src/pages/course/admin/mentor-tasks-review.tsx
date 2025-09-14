import { SessionProvider } from 'modules/Course/contexts';
import { MentorTasksReview } from 'modules/MentorTasksReview/pages/MentorTasksReview';
import { CourseRole } from 'services/models';

export default function () {
  return (
    <SessionProvider allowedRoles={[CourseRole.Manager, CourseRole.Dementor]}>
      <MentorTasksReview />
    </SessionProvider>
  );
}
