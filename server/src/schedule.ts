import { scheduleJob } from 'node-schedule';
import { ILogger } from './logger';
import { getStudentsScore, getCourseTasks, updateScoreStudents, getCourses } from './services/courseService';
import { round, mapValues, keyBy, sum } from 'lodash';

export function startBackgroundJobs(logger: ILogger) {
  scheduleJob('*/6 * * * *', async () => {
    logger.info('Starting score update job');

    const courses = await getCourses();

    for (const course of courses) {
      const start = Date.now();
      logger.info({ msg: `Updating course score`, course: course.name });

      const courseId = course.id;
      const [students, courseTasks] = await Promise.all([getStudentsScore(courseId), getCourseTasks(courseId)]);
      const weightMap = mapValues(keyBy(courseTasks, 'id'), 'scoreWeight');

      const scores = students
        .map(({ id, taskResults, totalScore }) => {
          const score = sum(taskResults.map(t => t.score * (weightMap[t.courseTaskId] || 1)));
          const newTotalScore = round(score, 1);
          return { id, totalScore: newTotalScore, changed: totalScore !== newTotalScore };
        })
        .filter(it => it.totalScore > 0 || it.changed);

      await updateScoreStudents(scores);
      logger.info({ msg: 'Updated course score', course: course.name, duration: Date.now() - start });
    }
  });
}
