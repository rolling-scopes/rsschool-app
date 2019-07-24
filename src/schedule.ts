import { scheduleJob } from 'node-schedule';
import { ILogger } from './logger';
import { getScoreStudents, getCourseTasks, updateScoreStudents, getCourses } from './services/courseService';
import { round, mapValues, keyBy, sum } from 'lodash';

export function startBackgroundJobs(logger: ILogger) {
  scheduleJob('*/5 * * * *', async () => {
    logger.info('update scores');

    const [courses, courseTasks] = await Promise.all([getCourses(), getCourseTasks()]);
    const weightMap = mapValues(keyBy(courseTasks, 'id'), 'scoreWeight');

    for await (const course of courses) {
      logger.info(`update course = [${course.id}]`);

      const courseId = course.id;
      const students = await getScoreStudents(courseId);

      const scores = students.map(({ id, taskResults }) => {
        const score = sum(taskResults.map(t => t.score * (weightMap[t.courseTaskId] || 1)));
        const totalScore = round(score, 1);
        return { id, totalScore };
      });

      const result = updateScoreStudents(scores);
      logger.info(result);
    }
  });
}
