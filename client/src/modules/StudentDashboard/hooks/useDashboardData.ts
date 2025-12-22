import groupBy from 'lodash/groupBy';
import omitBy from 'lodash/omitBy';

import { useRequest } from 'ahooks';
import {
  CourseScheduleItemDtoStatusEnum,
  CourseScheduleItemDtoTypeEnum,
  CoursesScheduleApi,
  CoursesTasksApi,
  CourseStatsApi,
  StudentsApi,
} from '@client/api';
import { TaskStat } from 'modules/StudentDashboard/components';
import { UserService } from 'services/user';

const coursesTasksApi = new CoursesTasksApi();
const coursesStatsApi = new CourseStatsApi();
const userService = new UserService();
const studentsApi = new StudentsApi();

export function useDashboardData(courseId: number, githubId: string) {
  return useRequest(async () => {
    const [
      { data: studentSummary },
      { data: courseTasks },
      statisticsCourses,
      { data: courseStats },
      { data: scheduleItems },
      { data: availableReviews },
    ] = await Promise.all([
      studentsApi.getStudentSummary(courseId, githubId),
      coursesTasksApi.getCourseTasks(courseId),
      userService.getProfileInfo(githubId),
      coursesStatsApi.getCourseStats(courseId),
      new CoursesScheduleApi().getSchedule(courseId),
      coursesTasksApi.getAvailableCrossCheckReviewStats(courseId),
    ]);

    const nextEvents = scheduleItems.filter(({ status }) => status === CourseScheduleItemDtoStatusEnum.Available);

    const tasksDetailCurrentCourse =
      statisticsCourses.studentStats?.find(currentCourse => currentCourse.courseId === courseId)?.tasks ?? [];

    const tasksByStatus = omitBy(
      groupBy(
        scheduleItems
          .filter(scheduleItem => scheduleItem.type === CourseScheduleItemDtoTypeEnum.CourseTask)
          .map(task => {
            const { comment, githubPrUri } =
              tasksDetailCurrentCourse.find(taskDetail => taskDetail.name === task.name) ?? {};

            return { ...task, comment, githubPrUri };
          }),
        'status',
      ),
      (_, status) => status === CourseScheduleItemDtoStatusEnum.Archived,
    ) as Record<CourseScheduleItemDtoStatusEnum, TaskStat[]>;

    const maxCourseScore = Math.round(
      courseTasks.reduce((score, task) => score + (task.maxScore ?? 0) * task.scoreWeight, 0),
    );

    return {
      studentSummary,
      courseTasks,
      courseStats,
      scheduleItems,
      availableReviews,
      nextEvents,
      tasksDetailCurrentCourse,
      tasksByStatus,
      maxCourseScore,
    };
  });
}
