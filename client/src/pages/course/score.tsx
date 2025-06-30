import { SessionProvider } from 'modules/Course/contexts';
import { ScorePage } from 'modules/Score/pages/ScorePage';

function Page() {
  return (
    <SessionProvider>
      <ScorePage />
    </SessionProvider>
  );
}

export default Page;
