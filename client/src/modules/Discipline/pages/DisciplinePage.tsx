import { Disciplines } from '../components/Disciplines';
import { DisciplineDto } from 'api';

export type IDisciplinePage = { disciplines?: DisciplineDto[] };

export const DisciplinePage = ({ disciplines }: IDisciplinePage) => {
  return <Disciplines disciplines={disciplines} />;
};
