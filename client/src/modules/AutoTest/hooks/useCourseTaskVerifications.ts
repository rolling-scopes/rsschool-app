import { message } from 'antd';
import { useMemo } from 'react';
import { useAsync } from 'react-use';
import { CourseService, Verification } from 'services/course';

export function useCourseTaskVerifications(
  courseId: number,
  courseTaskId?: number,
) {
  const courseService = useMemo(() => new CourseService(courseId), []);

  const {
    loading,
    value: allVerifications = [],
    error,
  } = useAsync(async () => await courseService.getTaskVerifications(), []);

  function filterVerifications(verifications: Verification[], taskId: number): any {
    return verifications?.filter((v: Verification) => v.courseTaskId === taskId);
  }

  const taskVerifications = useMemo(() => {
    if (courseTaskId) {
      return filterVerifications(allVerifications, courseTaskId);
    }

    return allVerifications;
  }, [allVerifications, courseTaskId]);

  if (error) {
    message.error(error);
  }

  return {
    verifications: taskVerifications,
    loading,
    filterVerifications,
  };
}
