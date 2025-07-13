import { SessionProvider } from 'modules/Course/contexts';
import { TeamDistributions } from 'modules/TeamDistribution/pages/TeamDistributions';

function Page() {
  return (
    <SessionProvider>
      <TeamDistributions />
    </SessionProvider>
  );
}

export default Page;
