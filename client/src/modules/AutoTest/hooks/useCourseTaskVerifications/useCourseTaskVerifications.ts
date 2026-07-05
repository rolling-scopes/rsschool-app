import { useRequest } from 'ahooks';
import { message } from 'antd';
import { CheckerEnum, CoursesTasksApi, CourseTaskDtoTypeEnum } from '@client/api';
import dayjs from 'dayjs';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import { mapTo } from '@client/modules/AutoTest/utils/map';
import { useEffect, useMemo, useState } from 'react';
import { useLocalStorage } from 'react-use';
import { CourseService, Verification } from '@client/services/course';

dayjs.extend(isSameOrAfter);

export function useCourseTaskVerifications(courseId: number) {
  const [isExerciseVisible, setIsExerciseVisible] = useState(false);
  // The Available/Missed/Done status is derived on the client; there is no server-side flag,
  // so tasks the student marks as done are persisted locally per course.
  const [manuallyDoneTaskIds = [], setManuallyDoneTaskIds] = useLocalStorage<number[]>(
    `autotest-done-tasks-${courseId}`,
    [],
  );

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
    data: verificationGroups = [],
    error,
    run: reload,
  } = useRequest(async () => await courseService.getTaskVerifications());

  const verificationsByTask = useMemo(() => {
    const grouped = new Map<number, Verification[]>();
    for (const group of verificationGroups) {
      grouped.set(group.courseTaskId, group.verifications);
    }
    return grouped;
  }, [verificationGroups]);

  const tasks = useMemo(
    () => courseTasks?.map(ct => mapTo(ct, verificationsByTask.get(ct.id) ?? [], manuallyDoneTaskIds)),
    [courseTasks, verificationsByTask, manuallyDoneTaskIds],
  );

  function markTaskAsDone(taskId: number) {
    if (!manuallyDoneTaskIds.includes(taskId)) {
      setManuallyDoneTaskIds([...manuallyDoneTaskIds, taskId]);
      message.success("The task has been moved to the 'Done' tab.");
    }
  }

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
    markTaskAsDone,
  };
}
