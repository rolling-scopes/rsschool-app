import { PageLayout } from 'components/PageLayout';
import { SessionContext, useActiveCourseContext } from 'modules/Course/contexts';
import Masonry from 'react-masonry-css';
import { DatePickerProps, Empty, theme } from 'antd';
import { useContext, useState } from 'react';
import { useCoursesStats, useStatCards } from '../hooks';
import { StatScope } from '../entities';
import { StatScopeSelector } from '../components/StatScopeSelector';
import css from 'styled-jsx/css';
import { useRouter, useSearchParams } from 'next/navigation';

const gapSize = 24;

function CourseStatistic() {
  const { isAdmin } = useContext(SessionContext);
  const router = useRouter();
  const searchParams = useSearchParams();
  const params = new URLSearchParams(searchParams);
  const [statScope, setStatScope] = useState<StatScope>(params.get('course') ? StatScope.Current : StatScope.Timeline);
  const { course } = useActiveCourseContext();
  const { token } = theme.useToken();
  const [ids, setIds] = useState<number[]>([course.id]);
  const [selectedYear, setSelectedYear] = useState<number>();
  const { loading, coursesData } = useCoursesStats({ ids, year: selectedYear });
  const { cards } = useStatCards({ coursesData });

  const masonryBreakPoints = {
    default: 4,
    1100: 3,
    700: 2,
    500: 1,
  };

  const handleStatScope = (value: boolean) => {
    if (value) {
      setStatScope(StatScope.Current);
      setIds([course.id]);
      setSelectedYear(0);
      params.set('course', course.alias);
      router.push(`?${params.toString()}`);
    } else {
      setStatScope(StatScope.Timeline);
      setIds([]);
      params.delete('course');
      router.push('');
    }
  };

  const handleYearSelection: DatePickerProps['onChange'] = date => {
    if (!date) {
      return;
    }

    setSelectedYear(date.year());
  };

  return (
    <PageLayout
      loading={loading}
      title={`Course${statScope === StatScope.Timeline && 's'} Statistics`}
      showCourseName={statScope === StatScope.Current}
      background={token.colorBgLayout}
    >
      {isAdmin && (
        <StatScopeSelector
          statScope={statScope}
          handleStatScope={handleStatScope}
          handleYearSelection={handleYearSelection}
        />
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
