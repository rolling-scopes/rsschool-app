import { message } from 'antd';
import { useMemo } from 'react';
import { useAsync } from 'react-use';
import { CourseService, Verification } from 'services/course';

export function useCourseTaskVerifications(
  courseId: number,
  courseTaskId?: number,
): { verifications: Verification[]; loading: boolean } {
  const courseService = useMemo(() => new CourseService(courseId), []);

  const {
    loading,
    value: allVerifications = [],
    error,
  } = useAsync(async () => await courseService.getTaskVerifications(), []);

  const taskVerifications = useMemo(() => {
    if (courseTaskId) {
      return allVerifications?.filter((v: Verification) => v.courseTaskId === courseTaskId);
    }

    return allVerifications;
  }, [allVerifications, courseTaskId]);

  if (error) {
    message.error(error);
  }

  return {
    verifications: taskVerifications,
    loading,
  };
}
