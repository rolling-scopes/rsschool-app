import { SessionProvider } from '@client/modules/Course/contexts';
import { MentorTasksReview } from '@client/modules/MentorTasksReview/pages/MentorTasksReview';
import { CourseRole } from 'services/models';

export default function () {
  return (
    <SessionProvider allowedRoles={[CourseRole.Manager, CourseRole.Dementor]}>
      <MentorTasksReview />
    </SessionProvider>
  );
}
