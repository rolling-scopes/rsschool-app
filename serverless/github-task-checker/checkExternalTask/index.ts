import { TaskEvent, ExternalTask } from '../handlers/submitTask';
import getCodecademy from './getCodecademy';
import getHtmlacademy from './getHtmlacademy';
import getUdemy from './getUdemy';
import { Result } from './types';

const SCORE = 100;

export default async ({ courseTask }: TaskEvent): Promise<{ score: number; details: string }> => {
  const { codecademy, htmlacademy, udemy } = courseTask as ExternalTask;
  const tasks = await Promise.all([getCodecademy(codecademy), getHtmlacademy(htmlacademy), getUdemy(udemy)]);

  const score = SCORE * Number(tasks.some((task: Result) => task.result));

  return {
    score,
    details: tasks.map((task, i) => `${i + 1}. ${task.details}`).join('\n'),
  };
};
