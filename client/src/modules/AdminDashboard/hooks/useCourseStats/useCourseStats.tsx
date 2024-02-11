import { message } from 'antd';
import { CourseStatsApi } from 'api';
import { useAsync } from 'react-use';

const courseStatsApi = new CourseStatsApi();

export function useCourseStats(courseId: number) {
  return useAsync(async () => {
    try {
      const [studentsCountries, studentsStats, mentorsCountries, mentorsStats] = await Promise.all([
        courseStatsApi.getCourseStudentCountries(courseId),
        courseStatsApi.getCourseStats(courseId),
        courseStatsApi.getCourseMentorCountries(courseId),
        courseStatsApi.getCourseMentors(courseId),
      ]);
      return {
        studentsCountries: studentsCountries.data,
        studentsStats: studentsStats.data,
        mentorsCountries: mentorsCountries.data,
        mentorsStats: mentorsStats.data,
      };
    } catch (error) {
      message.error('Something went wrong, please try to reload the page later');
    }
  }, [courseId]);
}
