import { getServerSideProps } from '../../modules/Discipline/data/getServerSideProps';
import { withSession } from '../../components';
import { DisciplinePage } from '../../modules/Discipline/pages/DisciplinePage';

export { getServerSideProps };
export default withSession(DisciplinePage);
