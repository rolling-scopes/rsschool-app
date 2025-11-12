import { CourseAggregateStatsDto } from 'api';
import { StudentsCountriesCard } from '@client/modules/CourseStatistics/components/StudentsCountriesCard';
import { StudentsStatsCard } from '@client/modules/CourseStatistics/components/StudentsStatsCard';
import { MentorsCountriesCard } from '@client/modules/CourseStatistics/components/MentorsCountriesCard/MentorsCountriesCard';
import { EpamMentorsStatsCard } from '@client/modules/CourseStatistics/components/EpamMentorsStatsCard';
import { StudentsWithMentorsCard } from '@client/modules/CourseStatistics/components/StudentsWithMentorsCard';
import { StudentsWithCertificateCard } from '@client/modules/CourseStatistics/components/StudentsWithCertificateCard';
import { StudentsEligibleForCertificationCard } from '@client/modules/CourseStatistics/components/StudentsEligibleForCertificationCard';
import { TaskPerformanceCard } from '@client/modules/CourseStatistics/components/TaskPerformanceCard';
import { StudentsCertificatesCountriesCard } from '@client/modules/CourseStatistics/components/StudentsCertificatesCountriesCard';
import Masonry from 'react-masonry-css';
import css from 'styled-jsx/css';

type StatCardsProps = {
  coursesData?: CourseAggregateStatsDto;
};

const gapSize = 24;

const masonryBreakPoints = {
  default: 4,
  1100: 3,
  700: 2,
  500: 1,
};

export function StatCards({ coursesData }: StatCardsProps) {
  const cards = [
    coursesData?.studentsCountries && {
      title: 'studentsCountriesCard',
      component: (
        <StudentsCountriesCard
          studentsCountriesStats={coursesData.studentsCountries}
          activeStudentsCount={coursesData.studentsStats.activeStudentsCount}
        />
      ),
    },
    coursesData?.studentsStats.totalStudents && {
      title: 'studentsStatsCard',
      component: <StudentsStatsCard studentsStats={coursesData.studentsStats} />,
    },
    coursesData?.mentorsCountries &&
      coursesData.mentorsStats.mentorsActiveCount && {
        title: 'mentorsCountriesCard',
        component: (
          <MentorsCountriesCard
            countriesStats={coursesData.mentorsCountries}
            activeCount={coursesData.mentorsStats.mentorsActiveCount}
          />
        ),
      },
    coursesData?.mentorsStats.epamMentorsCount && {
      title: 'mentorsStatsCard',
      component: <EpamMentorsStatsCard mentorsStats={coursesData.mentorsStats} />,
    },
    coursesData?.studentsStats.studentsWithMentorCount && {
      title: 'studentsWithMentorStatsCard',
      component: <StudentsWithMentorsCard studentsStats={coursesData.studentsStats} />,
    },
    coursesData?.studentsStats.certifiedStudentsCount && {
      title: 'studentsWithCertificateStatsCard',
      component: <StudentsWithCertificateCard studentsStats={coursesData.studentsStats} />,
    },
    !coursesData?.studentsStats.certifiedStudentsCount &&
      coursesData?.studentsStats.eligibleForCertificationCount && {
        title: 'StudentsEligibleForCertificationCard',
        component: <StudentsEligibleForCertificationCard studentsStats={coursesData.studentsStats} />,
      },
    coursesData?.courseTasks && {
      title: 'taskPerformanceCard',
      component: <TaskPerformanceCard tasks={coursesData.courseTasks} />,
    },
    coursesData?.studentsCertificatesCountries &&
      coursesData.studentsStats.certifiedStudentsCount && {
        title: 'studentsCertificatesCountriesCard',
        component: (
          <StudentsCertificatesCountriesCard
            studentsCertificatesCountriesStats={coursesData.studentsCertificatesCountries}
            certificatesCount={coursesData.studentsStats.certifiedStudentsCount}
          />
        ),
      },
  ].filter(Boolean);

  return (
    <>
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
    </>
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
