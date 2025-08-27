import { CoursesStatsDto } from '@client/api';
import { StudentsCountriesCard } from '../components/StudentsCountriesCard';
import { StudentsStatsCard } from '../components/StudentsStatsCard';
import { MentorsCountriesCard } from '../components/MentorsCountriesCard/MentorsCountriesCard';
import { EpamMentorsStatsCard } from '../components/EpamMentorsStatsCard';
import { StudentsWithMentorsCard } from '../components/StudentsWithMentorsCard';
import { StudentsWithCertificateCard } from '../components/StudentsWithCertificateCard';
import { StudentsEligibleForCertificationCard } from '../components/StudentsEligibleForCertificationCard';
import { TaskPerformanceCard } from '../components/TaskPerformanceCard';
import { StudentsCertificatesCountriesCard } from '../components/StudentsCertificatesCountriesCard';

type UseStatCardsProps = {
  coursesData?: CoursesStatsDto;
};

export function useStatCards({ coursesData }: UseStatCardsProps) {
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

  return { cards };
}
