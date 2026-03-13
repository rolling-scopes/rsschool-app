import { SessionProvider } from '@client/modules/Course/contexts';
import { TeamDistributions } from '@client/modules/TeamDistribution/pages/TeamDistributions';

function Page() {
  return (
    <SessionProvider>
      <TeamDistributions />
    </SessionProvider>
  );
}

export default Page;
