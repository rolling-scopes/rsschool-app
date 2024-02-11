import { AdminPageLayout } from 'components/PageLayout';
import { useActiveCourseContext } from 'modules/Course/contexts';
import Masonry from 'react-masonry-css';
import { StudentsCountriesCard } from '../components/StudentsCountriesCard';
import { useCourseStats } from '../hooks';
import { StudentsStatsCard } from '../components/StudentsStatsCard';
import css from 'styled-jsx/css';
import { MentorsCountriesCard } from '../components/MentorsCountriesCard/MentorsCountriesCard';
import { EpamMentorsStatsCard } from '../components/EpamMentorsStatsCard';

const gapSize = 24;

function AdminDashboard() {
  const { course, courses } = useActiveCourseContext();
  const { loading, value: stats } = useCourseStats(course.id);

  const masonryBreakPoints = {
    default: 4,
    1100: 3,
    700: 2,
    500: 1,
  };

  const cards = [
    stats?.studentsCountries && {
      title: 'studentsCountriesCard',
      component: (
        <StudentsCountriesCard
          studentsCountriesStats={stats.studentsCountries}
          studentsActiveCount={stats.studentsStats.studentsActiveCount}
        />
      ),
    },
    stats?.studentsStats && {
      title: 'studentsStatsCard',
      component: <StudentsStatsCard studentsStats={stats.studentsStats} />,
    },
    stats?.mentorsCountries &&
      stats.mentorsStats.mentorsActiveCount && {
        title: 'mentorsCountriesCard',
        component: (
          <MentorsCountriesCard
            countriesStats={stats.mentorsCountries}
            activeCount={stats.mentorsStats.mentorsActiveCount}
          />
        ),
      },
    stats?.mentorsStats.epamMentorsCount && {
      title: 'mentorsStatsCard',
      component: <EpamMentorsStatsCard mentorsStats={stats.mentorsStats} />,
    },
  ].filter(Boolean);

  return (
    <AdminPageLayout
      courses={courses}
      styles={{ background: '#e5e5e5' }}
      loading={loading}
      title="Dashboard"
      showCourseName
    >
      <Masonry
        breakpointCols={masonryBreakPoints}
        className={masonryClassName}
        columnClassName={masonryColumnClassName}
      >
        {cards.map(({ title, component }) => (
          <div style={{ marginBottom: gapSize }} key={title}>
            {component}
          </div>
        ))}
      </Masonry>
      {masonryStyles}
      {masonryColumnStyles}
    </AdminPageLayout>
  );
}

const { className: masonryClassName, styles: masonryStyles } = css.resolve`
  div {
    display: flex;
    margin-left: -${gapSize}px;
    width: auto;
    min-height: 85vh;
  }
`;
const { className: masonryColumnClassName, styles: masonryColumnStyles } = css.resolve`
  div {
    padding-left: ${gapSize}px;
    background-clip: padding-box;
  }
`;

export default AdminDashboard;
