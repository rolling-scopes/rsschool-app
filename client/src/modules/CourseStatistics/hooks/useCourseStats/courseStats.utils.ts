import { CourseStatsData, CourseStatsError } from './courseStats.types';
import { CountriesStatsDto, CoursesTasksApi, CourseStatsApi } from '@client/api';

const courseStatsApi = new CourseStatsApi();
const coursesTasksApi = new CoursesTasksApi();

export async function fetchCourseStats(courseId: number): Promise<CourseStatsData | CourseStatsError> {
  try {
    const [
      studentsCountries,
      studentsStats,
      mentorsCountries,
      mentorsStats,
      courseTasks,
      studentsCertificatesCountries,
    ] = await Promise.all([
      courseStatsApi.getCourseStudentCountries(courseId),
      courseStatsApi.getCourseStats(courseId),
      courseStatsApi.getCourseMentorCountries(courseId),
      courseStatsApi.getCourseMentors(courseId),
      coursesTasksApi.getCourseTasks(courseId),
      courseStatsApi.getCourseStudentCertificatesCountries(courseId),
    ]);

    return {
      studentsCountries: studentsCountries.data,
      studentsStats: studentsStats.data,
      mentorsCountries: mentorsCountries.data,
      mentorsStats: mentorsStats.data,
      courseTasks: courseTasks.data,
      studentsCertificatesCountries: studentsCertificatesCountries.data,
    } satisfies CourseStatsData;
  } catch {
    console.error(`Couldn't get stats for course with ID: ${courseId}`);
    return { error: true };
  }
}

export function mergeCountries(val1: CountriesStatsDto, val2: CountriesStatsDto) {
  return { countries: [...(val1?.countries || []), ...(val2?.countries || [])] };
}

export function mergeStats<T>(val1: T, val2: T): T {
  const shallowCopy = { ...val1 };
  for (const key in val2) {
    if (shallowCopy[key]) {
      (shallowCopy as Record<string, number>)[key] += val2[key] as number;
    } else {
      shallowCopy[key] = val2[key];
    }
  }
  return shallowCopy;
}
