import { SessionProvider } from 'modules/Course/contexts';
import { JobStudentPage } from 'modules/Job/pages/JobStudentPage';

export default function () {
  return (
    <SessionProvider>
      <JobStudentPage />
    </SessionProvider>
  );
}
