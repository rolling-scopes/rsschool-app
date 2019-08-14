import { Service } from '../interfaces';

const prepare = ({ tasks = [], scoreMapping = {} }: Service) => (task: any) => {
  if (tasks.includes(task.name)) {
    const scoreForFullCompletedTask = scoreMapping[task.name];
    const score = scoreForFullCompletedTask * task.progress * 0.01;

    return score;
  }
  return 0;
};

export default prepare;
