import { useRequest } from 'ahooks';
import { message } from 'antd';
import { CheckerEnum, CoursesTasksApi, CourseTaskDtoTypeEnum } from 'api';
import dayjs from 'dayjs';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import { mapTo } from 'modules/AutoTest/utils/map';
import { useEffect, useMemo, useState } from 'react';
import { CourseService } from 'services/course';

dayjs.extend(isSameOrAfter);

export function useCourseTaskVerifications(courseId: number) {
  const [isExerciseVisible, setIsExerciseVisible] = useState(false);

  const { data } = useRequest(async () => {
    const { data } = await new CoursesTasksApi().getCourseTasksDetailed(courseId);
    const now = dayjs();
    return data.filter(
      item =>
        item.checker === CheckerEnum.AutoTest &&
        item.type !== CourseTaskDtoTypeEnum.Test &&
        now.isSameOrAfter(item.studentStartDate),
    );
  });

  const courseTasks = data;
  const courseService = useMemo(() => new CourseService(courseId), []);

  const {
    loading,
    data: allVerifications = [],
    error,
    run: reload,
  } = useRequest(async () => await courseService.getTaskVerifications());

  const tasks = useMemo(() => courseTasks?.map(ct => mapTo(ct, allVerifications)), [courseTasks, allVerifications]);

  function startTask() {
    setIsExerciseVisible(true);
  }

  function finishTask() {
    reload();
    setIsExerciseVisible(false);
  }

  useEffect(() => {
    if (error?.message) {
      message.error(error.message);
    }
  }, [error?.message]);

  return {
    tasks,
    loading,
    isExerciseVisible,
    startTask,
    finishTask,
    reload,
  };
}
