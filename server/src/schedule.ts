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
      const dataStart = Date.now();
      const [students, courseTasks] = await Promise.all([getStudentsScore(courseId), getCourseTasks(courseId)]);
      logger.info({ msg: `Loaded course score`, course: course.name, duration: Date.now() - dataStart });
      const weightMap = mapValues(keyBy(courseTasks, 'id'), 'scoreWeight');

      const scores = students
        .map(({ id, taskResults, totalScore, totalScoreChangeDate }) => {
          const score = sum(taskResults.map(t => t.score * (weightMap[t.courseTaskId] || 1)));
          const newTotalScore = round(score, 1);

          const scoreChanged = totalScore !== newTotalScore;

          return {
            id,
            totalScore: scoreChanged ? newTotalScore : -1,
            totalScoreChangeDate: scoreChanged ? new Date() : totalScoreChangeDate,
          };
        })
        .filter(it => it.totalScore >= 0);

      await updateScoreStudents(scores);

      logger.info({
        msg: 'Updated course score',
        course: course.name,
        itemsCounts: scores.length,
        duration: Date.now() - start,
      });
    }
  });
}
