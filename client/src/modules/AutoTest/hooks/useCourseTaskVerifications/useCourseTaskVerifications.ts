import { message } from 'antd';
import { useMemo, useState } from 'react';
import { useAsync } from 'react-use';
import { CourseService } from 'services/course';
import { CourseTaskDetailedDto } from 'api';
import { mapTo } from 'modules/AutoTest/utils/map';

function isCourseTasksArray(item: unknown): item is CourseTaskDetailedDto[] {
  return !!item && Array.isArray(item);
}

export function useCourseTaskVerifications(courseId: number, item: CourseTaskDetailedDto | CourseTaskDetailedDto[]) {
  const [needsReload, setNeedsReload] = useState(false);
  const [isExerciseVisible, setIsExerciseVisible] = useState(false);

  const courseService = useMemo(() => new CourseService(courseId), []);

  const {
    loading,
    value: allVerifications = [],
    error,
  } = useAsync(async () => await courseService.getTaskVerifications(), [needsReload]);

  const tasks = useMemo(() => {
    if (isCourseTasksArray(item)) {
      return item?.map(ct => mapTo(ct, allVerifications));
    }
  }, [item, allVerifications]);

  const task = useMemo(() => {
    return mapTo(item as CourseTaskDetailedDto, allVerifications);
  }, [item, allVerifications]);

  function reloadVerifications() {
    setNeedsReload(!needsReload);
    setIsExerciseVisible(!isExerciseVisible);
  }

  const startTask = () => setIsExerciseVisible(true);

  if (error) {
    message.error(error);
  }

  return {
    task,
    tasks,
    loading,
    isExerciseVisible,
    reloadVerifications,
    startTask,
  };
}
