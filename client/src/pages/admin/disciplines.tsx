import { DisciplinePage } from 'modules/Discipline/pages/DisciplinePage';
import { ActiveCourseProvider, SessionProvider } from 'modules/Course/contexts';

export default function () {
  return (
    <ActiveCourseProvider>
      <SessionProvider adminOnly>
        <DisciplinePage />
      </SessionProvider>
    </ActiveCourseProvider>
  );
}
