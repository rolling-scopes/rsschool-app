import { DisciplinePage } from '@client/modules/Discipline/pages/DisciplinePage';
import { SessionProvider } from '@client/modules/Course/contexts';

export default function () {
  return (
    <SessionProvider adminOnly>
      <DisciplinePage />
    </SessionProvider>
  );
}
