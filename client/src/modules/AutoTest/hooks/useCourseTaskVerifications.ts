import { message } from 'antd';
import { useMemo, useState } from 'react';
import { useAsync } from 'react-use';
import { CourseService, Verification } from 'services/course';

export function useCourseTaskVerifications(courseId: number, courseTaskId?: number) {
  const [needsReload, setNeedsReload] = useState(false);
  const courseService = useMemo(() => new CourseService(courseId), []);

  const {
    loading,
    value: allVerifications = [],
    error,
  } = useAsync(async () => await courseService.getTaskVerifications(), [needsReload]);

  function filterVerifications(verifications: Verification[], taskId: number): any {
    return verifications?.filter((v: Verification) => v.courseTaskId === taskId);
  }

  const taskVerifications = useMemo(() => {
    if (courseTaskId) {
      return filterVerifications(allVerifications, courseTaskId);
    }

    return allVerifications;
  }, [allVerifications, courseTaskId]);

  function reloadVerifications() {
    setNeedsReload(!needsReload);
  }

  if (error) {
    message.error(error);
  }

  return {
    verifications: taskVerifications,
    loading,
    filterVerifications,
    reloadVerifications,
  };
}
