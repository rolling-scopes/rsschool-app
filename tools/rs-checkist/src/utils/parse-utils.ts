import { upperCase } from 'lodash';
import cliProgress from 'cli-progress';
import { Service, Student } from '../interfaces';
import rules from '../rules';
import methods from '../methods';
import scores from '../scores';
import tokens from '../constants/tokens';

const calculateScore = async (scoreRule: any, studentData: [string]) => {
  const scores = studentData.map(async (item: string) => await scoreRule(item));
  const fullScore = (await Promise.all(scores))
    .reduce((fullScore, score: number) => fullScore + score, 0);

  return fullScore;
};

export const getDataFromService = async (config: Service, students: Student[]) => {
  const { name, link, userParameter, queryParameters } = config;

  const token: string = tokens[upperCase(name)];
  const rule: Function = rules[name];
  const method: Function = methods[config.method];
  const scoreRule: Function = await scores[name](config);

  const fetchData = method.bind(
    null, token, queryParameters, link, userParameter, rule,
  );
  const calculate = calculateScore.bind(null, scoreRule);

  const progress = new cliProgress.Bar({}, cliProgress.Presets.shades_classic);
  let progressValue = 0;
  progress.start(students.length, 0);

  const results = await Promise.all(
    students.map(async ({ githubLogin, serviceLogin }: Student) => {
      const studentData = await fetchData(serviceLogin);

      progressValue += 1;
      progress.update(progressValue);
      if (progressValue === students.length) {
        progress.stop();
      }

      const score = await calculate(studentData);

      return {
        score,
        github: githubLogin,
      };
    }));

  return results;
};
