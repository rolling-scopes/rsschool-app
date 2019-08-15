import services from '../constants/services';
import { writeStudentResults } from '../utils/file-utils';
import { prepareScores, updateScores } from '../utils/rsschool-api-utils';
import { getScores } from '../utils/gss-api-utils';
import logger from '../utils/logger';

const service = 'gss';

export default async (id: string, taskName: string, output?: string) => {
  const config = services[service];

  if (!config) {
    return console.log('Undefined service name!');
  }

  console.log('Stage: get students\' scores from Google Spread Sheets');
  const result = await getScores(id);

  const scores = await prepareScores(config, result, taskName);

  console.log('\nStage: updating scores');
  const updateResult = await updateScores(JSON.stringify(scores));

  console.log('Job\'s done!');

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

  if (output) {
    const filename = `${output}errors-`;

    console.log('\nStage: writing logs to file');
    writeStudentResults(service, logger.logs, filename, 'json');
  }
};
