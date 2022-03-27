import { DisciplineProvider } from '../contexts/DisciplineContext';
import { Disciplines } from '../components/Disciplines';
import { IDiscipline } from '../model';
import { Session } from '../../../components/withSession';

type IDisciplinePage = { session: Session; disciplines?: IDiscipline[] };

export const DisciplinePage = ({ session, disciplines }: IDisciplinePage) => {
  return (
    <DisciplineProvider>
      <Disciplines session={session} disciplines={disciplines} />
    </DisciplineProvider>
  );
};
