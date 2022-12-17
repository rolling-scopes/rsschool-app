import { message } from 'antd';
import { useEffect, useMemo, useState } from 'react';
import { useAsync } from 'react-use';
import { CourseService } from 'services/course';
import { CourseTaskDetailedDto } from 'api';
import { mapTo } from 'modules/AutoTest/utils/map';

function isCourseTasksArray(item: unknown): item is CourseTaskDetailedDto[] {
  return !!item && Array.isArray(item);
}

function isCourseTask(item: unknown): item is CourseTaskDetailedDto {
  return !!item && typeof item === 'object' && 'id' in item;
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
    if (isCourseTask(item)) {
      return mapTo(item, allVerifications);
    }
  }, [item, allVerifications]);

  function startTask() {
    setIsExerciseVisible(true);
  }

  function finishTask() {
    reload();
    setIsExerciseVisible(false);
  }

  function reload() {
    setNeedsReload(!needsReload);
  }

  useEffect(() => {
    if (error?.message) {
      message.error(error.message);
    }
  }, [error?.message]);

  return {
    task,
    tasks,
    loading,
    isExerciseVisible,
    startTask,
    finishTask,
    reload,
  };
}
