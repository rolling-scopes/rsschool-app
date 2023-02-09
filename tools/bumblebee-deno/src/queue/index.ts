import { Queue } from './queue.ts';

export const queue = new Queue<() => Promise<void>>();

const processQueue = async () => {
  const task = queue.get();

  if (task && task === queue.current) {
    await task();
    queue.remove();
  }
};

setInterval(processQueue, 2000);
