import { ActiveCourseProvider, SessionProvider } from 'modules/Course/contexts';
import { ScorePage } from 'modules/Score/pages/ScorePage';

function Page() {
  return (
    <ActiveCourseProvider>
      <SessionProvider>
        <ScorePage />
      </SessionProvider>
    </ActiveCourseProvider>
  );
}

export default Page;
