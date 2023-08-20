import { DisciplinePage } from 'modules/Discipline/pages/DisciplinePage';
import { getCoursesProps as getServerSideProps } from 'modules/Course/data/getCourseProps';
import withSession, { Session } from 'components/withSession';
import { DefaultPageProvider } from 'modules/Course/contexts';
import { ProfileCourseDto } from 'api';

export { getServerSideProps };

function PageWithContext(props: { session: Session; courses: ProfileCourseDto[] }) {
  return (
    <DefaultPageProvider>
      <DisciplinePage {...props} />
    </DefaultPageProvider>
  );
}

export default withSession(PageWithContext, { onlyForAdmin: true });
