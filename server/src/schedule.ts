import { scheduleJob } from 'node-schedule';
import { ILogger } from './logger';
import { getScoreStudents, getCourseTasks, updateScoreStudents, getCourses } from './services/courseService';
import { round, mapValues, keyBy, sum } from 'lodash';

export function startBackgroundJobs(logger: ILogger) {
  scheduleJob('*/5 * * * *', async () => {
    logger.info('update scores');

    const courses = await getCourses();

    for await (const course of courses) {
      logger.info(`update course = [${course.id}]`);

      const courseId = course.id;
      const [students, courseTasks] = await Promise.all([getScoreStudents(courseId), getCourseTasks(courseId)]);
      const weightMap = mapValues(keyBy(courseTasks, 'id'), 'scoreWeight');

      const scores = students
        .map(({ id, taskResults, totalScore }) => {
          const score = sum(taskResults.map(t => t.score * (weightMap[t.courseTaskId] || 1)));
          const newTotalScore = round(score, 1);
          return { id, totalScore: newTotalScore, changed: totalScore !== newTotalScore };
        })
        .filter(it => it.totalScore > 0 && it.changed);

      const result = updateScoreStudents(scores);
      logger.info(result);
    }
  });
}
