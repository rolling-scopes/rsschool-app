import { message } from 'antd';
import { CourseStatsApi, StudentsCountriesStatsDto } from 'api';
import { PageLayout } from 'components/PageLayout';
import { useActiveCourseContext } from 'modules/Course/contexts';
import { useState } from 'react';
import Masonry from 'react-masonry-css';
import { useAsync } from 'react-use';
import { StudentsCountriesCard } from '../components/StudentsCountriesCard';

const courseStatsApi = new CourseStatsApi();

function AdminDashboard() {
  const { course } = useActiveCourseContext();
  const [studentsCountries, setStudentsCountries] = useState<StudentsCountriesStatsDto | null>(null);

  const loadData = async () => {
    try {
      const { data } = await courseStatsApi.getCourseStudentCountries(course.id);
      setStudentsCountries(data);
    } catch (error) {
      message.error('Something went wrong, please try reloading the page later');
    }
  };

  const { loading } = useAsync(loadData, [course.id]);

  return (
    <PageLayout loading={loading} title="RS Teams" background="#F0F2F5" showCourseName>
      <Masonry
        breakpointCols={{
          default: 4,
          1100: 3,
          700: 2,
          500: 1,
        }}
        className="masonry"
        columnClassName="masonry-column"
      >
        {studentsCountries && <StudentsCountriesCard studentsCountriesStats={studentsCountries} />}
      </Masonry>
    </PageLayout>
  );
}

export default AdminDashboard;
