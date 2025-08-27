import { PageLayout } from 'components/PageLayout';
import { SessionContext, useActiveCourseContext } from 'modules/Course/contexts';
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
import { DatePicker, DatePickerProps, Empty, Flex, Space, Switch, theme } from 'antd';
import CalendarOutlined from '@ant-design/icons/CalendarOutlined';
import { FundProjectionScreenOutlined } from '@ant-design/icons';
import { useContext, useState } from 'react';
import { useCoursesStats } from '../hooks/useCourseStats/useCourseStats';

const gapSize = 24;

enum StatScope {
  Current = 'Current',
  Timeline = 'Timeline',
}

function CourseStatistic() {
  const { isAdmin } = useContext(SessionContext);
  const [statScope, setStatScope] = useState<StatScope>(StatScope.Current);
  const { course } = useActiveCourseContext();
  const { token } = theme.useToken();
  const [ids, setIds] = useState<number[]>([course.id]);
  const [selectedYear, setSelectedYear] = useState<number>();
  const { loading, coursesData: stats } = useCoursesStats({ ids, year: selectedYear });

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

  const handleStatScope = (value: boolean) => {
    if (value) {
      setStatScope(StatScope.Current);
      setIds([course.id]);
      setSelectedYear(0);
    } else {
      setStatScope(StatScope.Timeline);
      setIds([]);
    }
  };

  const handleYearSelection: DatePickerProps['onChange'] = date => {
    if (!date) {
      return;
    }

    setSelectedYear(date.year());
  };

  return (
    <PageLayout loading={loading} title="Course Statistics" showCourseName background={token.colorBgLayout}>
      {isAdmin && (
        <Flex
          wrap={'wrap'}
          justify="space-between"
          align="center"
          gap="1rem"
          style={{ paddingBottom: '1rem', minHeight: '3rem' }}
        >
          <Space>
            {statScope === StatScope.Timeline && (
              <DatePicker allowClear={false} onChange={handleYearSelection} picker="year" />
            )}
          </Space>
          <Switch
            checkedChildren={
              <Space>
                Current <FundProjectionScreenOutlined />
              </Space>
            }
            unCheckedChildren={
              <Space>
                <CalendarOutlined /> Timeline
              </Space>
            }
            checked={statScope === StatScope.Current}
            onChange={handleStatScope}
          />
        </Flex>
      )}
      {statScope === StatScope.Timeline && !selectedYear ? (
        <Empty description="Please select the year" />
      ) : (
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
      )}
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
