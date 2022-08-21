import { DisciplinePage } from 'modules/Discipline/pages/DisciplinePage';
import { getServerSideProps } from 'modules/Home/data/getServerSideProps';
import { SessionProvider } from 'modules/Course/contexts';
import { ProfileCourseDto } from 'api';

export { getServerSideProps };

type Props = {
  courses: ProfileCourseDto[];
};

export default function (props: Props) {
  return (
    <SessionProvider>
      <DisciplinePage {...props} />
    </SessionProvider>
  );
}
