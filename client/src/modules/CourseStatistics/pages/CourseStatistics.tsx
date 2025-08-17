import { PageLayout } from 'components/PageLayout';
import { useActiveCourseContext } from 'modules/Course/contexts';
import Masonry from 'react-masonry-css';
import { StudentsCountriesCard } from '../components/StudentsCountriesCard';
import { StudentsStatsCard } from '../components/StudentsStatsCard';
import css from 'styled-jsx/css';
import { MentorsCountriesCard } from '../components/MentorsCountriesCard/MentorsCountriesCard';
import { EpamMentorsStatsCard } from '../components/EpamMentorsStatsCard';
import { StudentsWithMentorsCard } from '../components/StudentsWithMentorsCard';
import { StudentsWithCertificateCard } from '../components/StudentsWithCertificateCard';
import { StudentsEligibleForCertificationCard } from '../components/StudentsEligibleForCertificationCard';
import { TaskPerformanceCard } from '../components/TaskPerformanceCard';
import { StudentsCertificatesCountriesCard } from '../components/StudentsCertificatesCountriesCard';
import { Flex, Switch, theme, Typography } from 'antd';
import CalendarOutlined from '@ant-design/icons/CalendarOutlined';
import { FundProjectionScreenOutlined } from '@ant-design/icons';
import { useEffect, useState } from 'react';
import { useCoursesStats } from '../hooks/useCourseStats/useCourseStats';

const gapSize = 24;

enum StatScope {
  Current = 'Current',
  Timeline = 'Timeline',
}

function CourseStatistic() {
  const [statScope, setStatScope] = useState<StatScope>(StatScope.Current);
  const { course, courses } = useActiveCourseContext();
  const { token } = theme.useToken();
  const [ids, setIds] = useState<number[]>([]);
  const { loading, coursesData: stats } = useCoursesStats(ids);

  useEffect(() => {
    if (statScope === StatScope.Timeline) {
      const ids = courses.map(course => course.id);
      setIds(ids);
    } else {
      setIds([course.id]);
    }
  }, [course, courses, statScope]);

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
          activeStudentsCount={stats.studentsStats.activeStudentsCount}
        />
      ),
    },
    stats?.studentsStats.totalStudents && {
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
    stats?.studentsStats.studentsWithMentorCount && {
      title: 'studentsWithMentorStatsCard',
      component: <StudentsWithMentorsCard studentsStats={stats.studentsStats} />,
    },
    stats?.studentsStats.certifiedStudentsCount && {
      title: 'studentsWithCertificateStatsCard',
      component: <StudentsWithCertificateCard studentsStats={stats.studentsStats} />,
    },
    !stats?.studentsStats.certifiedStudentsCount &&
      stats?.studentsStats.eligibleForCertificationCount && {
        title: 'StudentsEligibleForCertificationCard',
        component: <StudentsEligibleForCertificationCard studentsStats={stats.studentsStats} />,
      },
    stats?.courseTasks && {
      title: 'taskPerformanceCard',
      component: <TaskPerformanceCard tasks={stats.courseTasks} />,
    },
    stats?.studentsCertificatesCountries &&
      stats.studentsStats.certifiedStudentsCount && {
        title: 'studentsCertificatesCountriesCard',
        component: (
          <StudentsCertificatesCountriesCard
            studentsCertificatesCountriesStats={stats.studentsCertificatesCountries}
            certificatesCount={stats.studentsStats.certifiedStudentsCount}
          />
        ),
      },
  ].filter(Boolean);

  const handleStatScope = () => {
    setStatScope(prev => (prev === StatScope.Current ? StatScope.Timeline : StatScope.Current));
  };

  return (
    <PageLayout loading={loading} title="Course Statistics" showCourseName background={token.colorBgLayout}>
      <Flex justify="space-between" align="center" gap="1rem" style={{ paddingBottom: '1rem' }}>
        <Typography>{statScope === StatScope.Current ? 'Current course' : 'Period of time'}</Typography>
        <Switch
          checkedChildren={<FundProjectionScreenOutlined />}
          unCheckedChildren={<CalendarOutlined />}
          checked={statScope === StatScope.Current}
          onChange={handleStatScope}
        />
      </Flex>
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
    </PageLayout>
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

export default CourseStatistic;
