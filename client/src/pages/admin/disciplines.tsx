import { DisciplinePage } from 'modules/Discipline/pages/DisciplinePage';
import { getCoursesProps as getServerSideProps } from 'modules/Course/data/getCourseProps';
import withSession, { Session } from 'components/withSession';
import { SessionAndCourseProvider } from 'modules/Course/contexts';
import { ProfileCourseDto } from 'api';

export { getServerSideProps };

function PageWithContext(props: { session: Session; courses: ProfileCourseDto[] }) {
  return (
    <SessionAndCourseProvider>
      <DisciplinePage {...props} />
    </SessionAndCourseProvider>
  );
}

export default withSession(PageWithContext, { onlyForAdmin: true });
