import services from '../constants/services';
import { writeStudentResults } from '../utils/file-utils';
import { getDataFromService } from '../utils/parse-utils';
import { getStudents, prepareScores } from '../utils/rsschool-api-utils';

export default async (service: string, output: string) => {
  const config = services[service];

  if (!config) {
    return console.log('Undefined service name!');
  }

  console.log('Stage: fetching students from RS School API');
  const students = await getStudents(service);

  console.log(`Stage: fetching ${service} data:\n`);
  const results = await getDataFromService(config, students);

  const buffer = await prepareScores(config, results);
  console.log('\nStage: writing to file');
  writeStudentResults(service, buffer, output, 'json');
};
