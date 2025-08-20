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
import { Button, DatePicker, DatePickerProps, Dropdown, Flex, MenuProps, Space, Switch, theme, Typography } from 'antd';
import CalendarOutlined from '@ant-design/icons/CalendarOutlined';
import { ClearOutlined, DownOutlined, FundProjectionScreenOutlined } from '@ant-design/icons';
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
  const [coursesItems, setCoursesItems] = useState<MenuProps['items']>([]);
  const { token } = theme.useToken();
  const [ids, setIds] = useState<number[]>([]);
  const selectCourseDefaultMessage = 'Select the course';
  const [selectedCourse, setSelectedCourse] = useState<string | undefined>(selectCourseDefaultMessage);
  const [selectedYear, setSelectedYear] = useState<number>();
  const { loading, coursesData: stats } = useCoursesStats(ids);

  useEffect(() => {
    if (statScope === StatScope.Timeline) {
      const ids = courses.map(course => course.id);
      setIds(ids);
      const list = courses.map(({ fullName, id }) => ({ label: fullName, key: id.toString() }));
      setCoursesItems(list);
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

  const getCoursesByDate = (selectedYear: number = 0) => {
    const ids = courses
      .map(({ startDate, id }) => {
        const year = new Date(startDate).getFullYear();
        if (year >= selectedYear) {
          return id;
        }
      })
      .filter(Boolean);
    setIds(ids);

    const list = courses
      .map(({ fullName, id, startDate }) => {
        const year = new Date(startDate).getFullYear();
        if (year >= selectedYear) {
          return { label: fullName, key: id.toString() };
        }
      })
      .filter(Boolean);
    setCoursesItems(list);
  };

  const handleCourseSelection: MenuProps['onClick'] = e => {
    const id = Number(e.key);
    setIds([id]);
    const label = courses?.find(el => el.id === id)?.fullName;
    setSelectedCourse(label);
    setSelectedYear(undefined);
  };

  const clearCourseSelection = () => {
    setSelectedCourse(selectCourseDefaultMessage);
    getCoursesByDate(selectedYear);
  };

  const handleYearSelection: DatePickerProps['onChange'] = date => {
    if (!date) {
      clearCourseSelection();
      return;
    }

    const selected = date.year();
    setSelectedCourse(selectCourseDefaultMessage);
    setSelectedYear(date.year());
    getCoursesByDate(selected);
  };

  return (
    <PageLayout loading={loading} title="Course Statistics" showCourseName background={token.colorBgLayout}>
      <Flex justify="space-between" align="center" gap="1rem" style={{ paddingBottom: '1rem' }}>
        {statScope === StatScope.Current ? (
          <Typography>Course: {course.name}</Typography>
        ) : (
          <>
            <Space>
              <Dropdown trigger={['click']} menu={{ items: coursesItems, onClick: handleCourseSelection }}>
                <Button>
                  <Space>
                    {selectedCourse}
                    <DownOutlined />
                  </Space>
                </Button>
              </Dropdown>
              <Button shape="circle" onClick={clearCourseSelection}>
                <ClearOutlined />
              </Button>
            </Space>
            <DatePicker onChange={handleYearSelection} picker="year" />
          </>
        )}
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
