import { TaskEvent } from '../handlers/submitTask';
import getCodecademy from './getCodecademy';
import getHtmlacademy from './getHtmlacademy';
import getUdemy from './getUdemy';

const SCORE = 100;

export default async ({
  courseTask: {
    codecademy,
    htmlacademy,
    udemy,
  },
}: TaskEvent) => {
  const tasks = await Promise.all([
    getCodecademy(codecademy),
    getHtmlacademy(htmlacademy),
    getUdemy(udemy),
  ]);

  return SCORE * Number(tasks.some((task: boolean) => task));
};
