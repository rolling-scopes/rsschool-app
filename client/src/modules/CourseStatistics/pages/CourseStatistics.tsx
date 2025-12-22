import { PageLayout } from '@client/shared/components/PageLayout';
import { SessionContext, useActiveCourseContext } from 'modules/Course/contexts';
import { DatePickerProps, Empty, theme } from 'antd';
import { useContext, useState } from 'react';
import { useCoursesStats } from '../hooks';
import { StatScope } from '../constants';
import { StatScopeSelector } from '../components/StatScopeSelector';
import { StatCards } from '../components/StatCards';
import { useRouter, useSearchParams } from 'next/navigation';
import dayjs from 'dayjs';

function CourseStatistic() {
  const { isAdmin } = useContext(SessionContext);
  const router = useRouter();
  const searchParams = useSearchParams();
  const params = new URLSearchParams(searchParams.toString());
  const [statScope, setStatScope] = useState<StatScope>(params.get('course') ? StatScope.Current : StatScope.Timeline);
  const { course } = useActiveCourseContext();
  const { token } = theme.useToken();
  const [ids, setIds] = useState<number[]>([course.id]);
  const selectedYear = Number(params.get('year'));
  const { loading, coursesData } = useCoursesStats({ ids, year: selectedYear });

  const handleStatScope = (value: boolean) => {
    if (value) {
      setStatScope(StatScope.Current);
      setIds([course.id]);
      params.set('course', course.alias);
      params.delete('year');
    } else {
      setStatScope(StatScope.Timeline);
      setIds([]);
      params.delete('course');
      params.set('year', dayjs(new Date()).year().toString());
    }
    router.push(`?${params.toString()}`);
  };

  const handleYearSelection: DatePickerProps['onChange'] = date => {
    if (!date) {
      return;
    }
    params.set('year', date.year().toString());
    router.push(`?${params.toString()}`);
  };

  return (
    <PageLayout
      loading={loading}
      title={`Course${statScope === StatScope.Timeline ? 's' : ''} Statistics`}
      showCourseName={statScope === StatScope.Current}
      background={token.colorBgLayout}
    >
      {isAdmin && (
        <StatScopeSelector
          statScope={statScope}
          handleStatScope={handleStatScope}
          handleYearSelection={handleYearSelection}
          selectedYear={selectedYear}
        />
      )}
      {statScope === StatScope.Timeline && !selectedYear ? (
        <Empty description="No data available." />
      ) : (
        <StatCards coursesData={coursesData} />
      )}
    </PageLayout>
  );
}

export default CourseStatistic;
