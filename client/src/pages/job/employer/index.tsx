import { SessionProvider } from 'modules/Course/contexts';
import { JobEmployerPage } from 'modules/Job/pages/JobEmployeerPage';

export default function () {
  return (
    <SessionProvider>
      <JobEmployerPage />
    </SessionProvider>
  );
}
