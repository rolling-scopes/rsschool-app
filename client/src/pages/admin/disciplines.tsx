import { getServerSideProps } from '../../modules/Discipline/data/getServerSideProps';
import { DisciplinePage } from '../../modules/Discipline/pages/DisciplinePage';
import withSession from '../../components/withSession';

export { getServerSideProps };
export default withSession(DisciplinePage);
