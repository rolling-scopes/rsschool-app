import Router from '@koa/router';
import { OK } from 'http-status-codes';
import { parseAsync } from 'json2csv';
import { isUndefined } from 'lodash';
import { ScoreTableFilters } from '../../../../../common/types/score';
import { ILogger } from '../../../logger';
import { getCourseTasks } from '../../../services/course.service';
import { ScoreService } from '../../../services/score.service';
import { CourseTask, Task } from '../../../models';
import { setCsvResponse } from '../../utils';

export const getScoreAsCsv = (_: ILogger) => async (ctx: Router.RouterContext) => {
  const courseId = ctx.params.courseId;
  const { cityName, ['mentor.githubId']: mentor } = ctx.query;
  let filters: ScoreTableFilters = {
    activeOnly: false,
    githubId: '',
    name: '',
    'mentor.githubId': '',
    cityName: '',
  };

  if (!isUndefined(cityName)) {
    filters = { ...filters, cityName };
  }
  if (!isUndefined(mentor)) {
    filters = { ...filters, ['mentor.githubId']: mentor };
  }

  const service = new ScoreService(courseId);
  const students = await service.getStudentsScore(undefined, filters);

  const courseTasks = await getCourseTasks(courseId);

  const result = students.content.map(student => {
    return {
      githubId: student.githubId,
      name: student.name,
      locationName: student.cityName,
      countryName: student.countryName || 'Other',
      mentorGithubId: student.mentor ? student.mentor.githubId : '',
      totalScore: student.totalScore,
      isActive: student.isActive,
      ...getTasksResults(student.taskResults, courseTasks),
    };
  });
  const csv = await parseAsync(result);
  setCsvResponse(ctx, OK, csv, 'score');
};

function getTasksResults(taskResults: { courseTaskId: number; score: number }[], courseTasks: CourseTask[]) {
  return courseTasks.reduce((acc, courseTask) => {
    const r = taskResults.find(r => r.courseTaskId === courseTask.id);
    acc[(courseTask.task as Task).name] = r ? r.score : 0;
    return acc;
  }, {} as Record<string, number>);
  return {};
}
