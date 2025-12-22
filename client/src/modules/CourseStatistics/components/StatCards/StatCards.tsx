import { CourseAggregateStatsDto, CoursesTasksApi, CourseTaskDto } from '@client/api';
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
import { useAsync } from 'react-use';
import styles from './StatCards.module.css';
import { useActiveCourseContext } from '@client/modules/Course/contexts';

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

const coursesTasksApi = new CoursesTasksApi();

export function StatCards({ coursesData }: StatCardsProps) {
  const { course } = useActiveCourseContext();
  const { value: courseTasks } = useAsync(async () => {
    if (course?.id) {
      const { data } = await coursesTasksApi.getCourseTasks(course.id);

      return data;
    }
  }, [course]);

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
    coursesData?.courseTasks &&
      courseTasks && {
        title: 'taskPerformanceCard',
        component: (
          <TaskPerformanceCard
            tasks={courseTasks.filter((task: CourseTaskDto) => coursesData.courseTasks?.some(ct => ct.id === task.id))}
          />
        ),
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
      <Masonry breakpointCols={masonryBreakPoints} className={styles.masonry!} columnClassName={styles.masonryColumn!}>
        {cards.map(({ title, component }) => (
          <div style={{ marginBottom: gapSize }} key={title}>
            {component}
          </div>
        ))}
      </Masonry>
    </>
  );
}
