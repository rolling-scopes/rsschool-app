import { message } from 'antd';
import { CourseStatsApi } from 'api';
import { useAsync } from 'react-use';

const courseStatsApi = new CourseStatsApi();

export function useCourseStats(courseId: number) {
  return useAsync(async () => {
    try {
      const [studentsCountries, studentsStats] = await Promise.all([
        courseStatsApi.getCourseStudentCountries(courseId),
        courseStatsApi.getCourseStats(courseId),
      ]);
      return {
        studentsCountries: studentsCountries.data,
        studentsStats: studentsStats.data,
      };
    } catch (error) {
      message.error('Something went wrong, please try to reload the page later');
    }
  }, [courseId]);
}
