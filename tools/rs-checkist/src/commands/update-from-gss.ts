import commander from 'commander';
import services from '../constants/services';
import { writeStudentResults } from '../utils/file-utils';
import { prepareScores, updateScores, setUpCourseId } from '../utils/rsschool-api-utils';
import { getScores } from '../utils/gss-api-utils';
import logger from '../utils/logger';

const service = 'gss';

export default async (id: string, taskName: string) => {
  const config = services[service];

  const env = process.env.STAGE || 'dev';
  console.log(`Starting on ${env} environment...\n`);

  if (!config) {
    return console.log('Undefined service name!');
  }

  console.log('Stage: find specified course');
  let courseAlias: string = '';
  if (commander.courseAlias) {
    courseAlias = commander.courseAlias.toLowerCase();
  }
  await setUpCourseId(courseAlias);

  console.log('Stage: get students\' scores from Google Spread Sheets');
  const result = await getScores(id);

  const scores = await prepareScores(config, result, taskName);

  console.log('\nStage: updating scores');
  const updateResult = await updateScores(JSON.stringify(scores));

  updateResult.data.forEach((item: any) => {
    if (item.status === 'skipped') {
      logger.push({
        description: `Score didn't updated: ${item.value}`,
      });
    }
  });

  if (!!logger.logs.length) {
    console.log('\nError logs:');
    console.log(logger.logs);
  }

  if (commander.output) {
    const filename = `${commander.output}errors-`;

    console.log('\nStage: writing logs to file');
    writeStudentResults(service, logger.logs, filename, 'json');
  }

  console.log('\nJob\'s done!');
};
