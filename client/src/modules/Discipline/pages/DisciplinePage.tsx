import { DisciplineProvider } from '../contexts/DisciplineContext';
import { Disciplines } from '../components/Disciplines';
import { Session } from '../../../components';
import { IDiscipline } from '../model';

type IDisciplinePage = { session: Session; disciplines?: IDiscipline[] };

export const DisciplinePage = ({ session, disciplines }: IDisciplinePage) => {
  return (
    <DisciplineProvider>
      <Disciplines session={session} disciplines={disciplines} />
    </DisciplineProvider>
  );
};
