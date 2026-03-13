import { SessionProvider } from '@client/modules/Course/contexts';
import { InterviewWaitingList } from '@client/modules/Mentor/pages/InterviewWaitingList';
import { CourseRole } from '@client/services/models';

function Page() {
  return (
    <SessionProvider allowedRoles={[CourseRole.Mentor, CourseRole.Manager]}>
      <InterviewWaitingList />
    </SessionProvider>
  );
}

export default Page;
