import { Disciplines } from '../../modules/Discipline/pages/Disciplines';
import { getServerSideProps } from '../../modules/Discipline/data/getServerSideProps';
import { withSession } from '../../components';

export { getServerSideProps };
export default withSession(Disciplines);
