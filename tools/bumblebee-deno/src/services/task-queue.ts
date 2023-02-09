import { Queue } from '../utils/queue.ts';

export const taskQueue = new Queue<() => Promise<void>>();

const processQueue = async () => {
  const task = taskQueue.get();

  if (task && task === taskQueue.current) {
    await task();
    taskQueue.remove();
  }
};

setInterval(processQueue, 2000);
