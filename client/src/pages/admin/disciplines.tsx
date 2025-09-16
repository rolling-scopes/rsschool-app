import { DisciplinePage } from 'modules/Discipline/pages/DisciplinePage';
import { SessionProvider } from 'modules/Course/contexts';

export default function () {
  return (
    <SessionProvider adminOnly>
      <DisciplinePage />
    </SessionProvider>
  );
}
