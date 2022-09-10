import { SessionProvider } from 'modules/Course/contexts';
import { JobPage } from 'modules/Job/pages/JobPage';

export default function () {
  return (
    <SessionProvider>
      <JobPage />
    </SessionProvider>
  );
}
