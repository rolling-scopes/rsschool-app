import { useAsync } from 'react-use';
import { CoursesService } from 'services/courses';
import { Course } from 'services/models';
import { UserService } from 'services/user';
import { StudentStats } from '../../../../../../../common/models';

type IdName = {
  id: number;
  name: string;
};

export function useStudentCourseData(githubId: string, courseAlias: string | undefined) {
  const {
    value: student,
    loading: studentLoading,
    error: studentError,
  } = useAsync(async () => {
    const userService = new UserService();
    const courseService = new CoursesService();
    const [profile, profileInfo, courses] = await Promise.all([
      userService.getMyProfile(),
      userService.getProfileInfo(githubId),
      courseService.getCourses(),
    ]);
    const registeredForCourses = enrolledOtherCourses(profileInfo?.studentStats, courses);
    const activeCourses = courseAlias
      ? courses.filter(
          (course: Course) => course.alias === courseAlias && isCourseOpenForRegistry(registeredForCourses)(course),
        )
      : courses.filter(isCourseOpenForRegistry(registeredForCourses)).sort(sortByStartDate);
    return {
      profile,
      registeredForCourses,
      courses: activeCourses,
    };
  }, [githubId, courseAlias]);

  return { student, studentLoading, studentError };
}

function enrolledOtherCourses(studentStats: StudentStats[] | undefined, courses: Course[]) {
  return (
    studentStats?.reduce((acc, { isExpelled, isCourseCompleted, courseId }) => {
      const course = courses?.find(el => el.id === courseId);
      if (!isExpelled && !isCourseCompleted && course?.completed === false) {
        acc.push({ id: courseId, name: `${course.name} (${getStatus(course)})` });
      }
      return acc;
    }, [] as IdName[]) ?? []
  );
}

function isCourseOpenForRegistry(registeredCourses: IdName[]) {
  // invite only courses do not open for public registration
  return (course: Course) => {
    if (course.inviteOnly || course.completed || registeredCourses.some(({ id }) => id === course.id)) {
      return false;
    }
    if (course.planned) {
      return true;
    }
    if (course.registrationEndDate) {
      return new Date(course.registrationEndDate).getTime() > Date.now();
    }
    return false;
  };
}

function sortByStartDate(a: Course, b: Course) {
  return a.startDate.localeCompare(b.startDate);
}

function getStatus(course: Course) {
  if (course.planned) {
    return 'Planned';
  }
  return 'Active';
}
