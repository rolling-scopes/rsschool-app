import { TaskEvent, ExternalTask } from '../handlers/submitTask';
import getCodecademy from './getCodecademy';
import getHtmlacademy from './getHtmlacademy';
import getUdemy from './getUdemy';

const SCORE = 100;

export default async ({ courseTask }: TaskEvent) => {
  const { codecademy, htmlacademy, udemy } = courseTask as ExternalTask;
  const tasks = await Promise.all([getCodecademy(codecademy), getHtmlacademy(htmlacademy), getUdemy(udemy)]);

  return SCORE * Number(tasks.some((task: boolean) => task));
};
