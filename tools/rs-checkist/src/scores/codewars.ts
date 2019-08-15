import { Service } from '../interfaces';
import tokens from '../constants/tokens';
import methods from '../methods';

const rule = ({ slug, rank: { name } }: any, scoreMapping: any) => {
  const kyu = name ? parseInt(name, 10) : 8;

  return {
    score: scoreMapping[kyu],
    name: slug,
  };
};

const scores = async (
  tasksWithScores: any[],
  taskName: string,
) => {
  const foundTask = (await Promise.all(tasksWithScores))
    .find((task: any) => task.name === taskName);

  if (foundTask) return foundTask.score;
  return 0;
};

const prepare = async (
  { queryParameters: { tokenParameter }, taskParameter, scoreMapping, link, tasks = [] }: Service,
) => {
  const tasksWithScores: any[] = tasks.map((taskName: string) => {
    return methods.codewarsApi(
      tokens.CODEWARS, { tokenParameter }, link, taskParameter, rule, taskName, scoreMapping,
    );
  });

  return scores.bind(null, tasksWithScores);
};

export default prepare;
