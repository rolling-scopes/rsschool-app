import { SessionProvider } from 'modules/Course/contexts';
import { InterviewWaitingList } from 'modules/Mentor/pages/InterviewWaitingList';
import { CourseRole } from 'services/models';

function Page() {
  return (
    <SessionProvider allowedRoles={[CourseRole.Mentor, CourseRole.Manager]}>
      <InterviewWaitingList />
    </SessionProvider>
  );
}

export default Page;
