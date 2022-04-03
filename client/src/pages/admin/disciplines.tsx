import { getServerSideProps } from '../../modules/Discipline/data/getServerSideProps';
import { SessionProvider } from 'modules/Course/contexts';
import { DisciplinePage, IDisciplinePage } from '../../modules/Discipline/pages/DisciplinePage';

export { getServerSideProps };
export default function (props: IDisciplinePage) {
  return (
    <SessionProvider>
      <DisciplinePage {...props} />
    </SessionProvider>
  );
}
