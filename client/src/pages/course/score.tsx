import { SessionProvider } from '@client/modules/Course/contexts';
import { ScorePage } from '@client/modules/Score/pages/ScorePage';

function Page() {
  return (
    <SessionProvider>
      <ScorePage />
    </SessionProvider>
  );
}

export default Page;
