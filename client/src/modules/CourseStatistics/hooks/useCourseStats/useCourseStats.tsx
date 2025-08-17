import { useCallback, useEffect, useState } from 'react';
import { useMessage } from '@client/hooks';
import { memoize } from 'lodash';
import { CourseStatsData } from './courseStats.types';
import { fetchCourseStats, mergeCountries, mergeStats } from './courseStats.utils';

export function useCoursesStats(ids: number[]) {
  const [loading, setLoading] = useState<boolean>(false);
  const [coursesData, setCoursesData] = useState<CourseStatsData>();
  const { message } = useMessage();

  const cached = useCallback(memoize(fetchCourseStats), []);

  async function retrieveData() {
    if (ids.length === 0) {
      return;
    }

    if (ids.length === 1) {
      return await cached(ids[0]);
    }

    const promises = ids.map(id => cached(id));

    const resolved = await Promise.all(promises);

    return resolved.reduce<CourseStatsData>((acc, course) => {
      if ('error' in course) {
        return acc;
      }

      const {
        studentsCountries,
        studentsStats,
        mentorsCountries,
        mentorsStats,
        courseTasks,
        studentsCertificatesCountries,
      } = course;

      return {
        ...acc,
        studentsCountries: mergeCountries(acc.studentsCountries, studentsCountries),
        studentsStats: mergeStats(acc.studentsStats, studentsStats),
        mentorsCountries: mergeCountries(acc.mentorsCountries, mentorsCountries),
        mentorsStats: mergeStats(acc.mentorsStats, mentorsStats),
        courseTasks: [...(acc?.courseTasks || []), ...(courseTasks || [])],
        studentsCertificatesCountries: mergeCountries(acc.studentsCertificatesCountries, studentsCertificatesCountries),
      };
    }, {} as CourseStatsData);
  }

  useEffect(() => {
    setLoading(true);
    retrieveData().then(result => {
      setLoading(false);
      if (result && 'error' in result) {
        message.error("Can't load courses data. Please try latter.");
      } else {
        setCoursesData(result);
      }
    });
  }, [ids]);

  return { loading, coursesData };
}
