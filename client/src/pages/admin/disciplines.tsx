import { DisciplinePage } from 'modules/Discipline/pages/DisciplinePage';
import { getCoursesProps as getServerSideProps } from 'modules/Course/data/getCourseProps';
import withSession, { Session } from 'components/withSession';
import { SessionProvider } from 'modules/Course/contexts';
import { ProfileCourseDto } from 'api';

export { getServerSideProps };

function PageWithContext(props: { session: Session; courses: ProfileCourseDto[] }) {
  return (
    <SessionProvider>
      <DisciplinePage {...props} />
    </SessionProvider>
  );
}

export default withSession(PageWithContext, { onlyForAdmin: true });
