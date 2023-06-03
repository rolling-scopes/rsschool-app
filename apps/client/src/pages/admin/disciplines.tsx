import { DisciplinePage } from 'modules/Discipline/pages/DisciplinePage';
import { getCoursesProps as getServerSideProps } from 'modules/Course/data/getCourseProps';
import withSession from 'components/withSession';

export { getServerSideProps };

export default withSession(DisciplinePage, { onlyForAdmin: true });
