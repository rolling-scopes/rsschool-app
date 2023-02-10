import { Queue } from '../utils/queue.ts';
import { registerError } from './cache.ts';

export const taskQueue = new Queue<() => Promise<void>>();

const processQueue = async () => {
  const task = taskQueue.get();

  if (task && task === taskQueue.current) {
    try {
      await task();
      taskQueue.remove();
    } catch (error) {
      await registerError('Task Queue Service', error);
    }
  }
};

setInterval(processQueue, 2000);
