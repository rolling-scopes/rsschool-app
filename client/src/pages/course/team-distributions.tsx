import { ActiveCourseProvider, SessionProvider } from 'modules/Course/contexts';
import { TeamDistributions } from 'modules/TeamDistribution/pages/TeamDistributions';

function Page() {
  return (
    <SessionProvider>
      <ActiveCourseProvider>
        <TeamDistributions />
      </ActiveCourseProvider>
    </SessionProvider>
  );
}

export default Page;
