import { useAsync } from 'react-use';
import { CoursesService } from 'services/courses';
import { Course } from 'services/models';
import { UserService } from 'services/user';
import { StudentStats } from 'common/models';
import { useState } from 'react';

type IdName = {
  id: number;
  name: string;
};

export function useStudentCourseData(githubId: string, courseAlias: string | undefined) {
  const [registered, setRegistered] = useState<boolean | null>(null);

  const { value: student, loading } = useAsync(async () => {
    const userService = new UserService();
    const courseService = new CoursesService();
    const [profile, profileInfo, courses] = await Promise.all([
      userService.getMyProfile(),
      userService.getProfileInfo(githubId),
      courseService.getCourses(),
    ]);

    const registeredForCourses = enrolledOtherCourses(profileInfo?.studentStats, courses);
    if (courseAlias) {
      const currentCourse = courses.find(course => course.alias === courseAlias);
      const value = registeredForCourses.some(({ id }) => id === currentCourse?.id);
      if (value) {
        setRegistered(registeredForCourses.some(({ id }) => id === currentCourse?.id));
        return;
      }
    }
    setRegistered(false);
    const activeCourses = courseAlias
      ? courses.filter(isCourseOpenForRegistryWithAlias(courseAlias))
      : courses.filter(isCourseOpenForRegistry(registeredForCourses)).sort(sortByStartDate);
    return {
      profile,
      registeredForCourses,
      courses: activeCourses,
    };
  }, [githubId, courseAlias]);

  return [student, loading, registered] as const;
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
  return (course: Course) => {
    // invite only courses do not open for public registration
    if (course.inviteOnly) {
      return false;
    }
    return isCourseAvailableForRegistration(course, registeredCourses);
  };
}

function isCourseOpenForRegistryWithAlias(courseAlias?: string) {
  return (course: Course) => courseAlias === course.alias && isCourseAvailableForRegistration(course, []);
}

function isCourseAvailableForRegistration(course: Course, registeredCourses: IdName[]) {
  if (course.completed || registeredCourses.some(({ id }) => id === course.id)) {
    return false;
  }

  const isRegistrationActive = new Date(course.registrationEndDate || 0).getTime() > Date.now();
  if (isRegistrationActive) {
    return true;
  }

  if (course.planned) {
    return true;
  }

  return false;
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
