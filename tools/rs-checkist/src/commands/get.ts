import services from '../constants/services';
import { getStudents, writeStudentResults } from '../utils/file-utils';
import { getDataFromService } from '../utils/parse-utils';

export default async (service: string, input: string, output: string) => {
  const config = services[service];

  if (!config) {
    return console.log('Undefined service name!');
  }

  console.log('Stage: fetching students from file');
  const students = getStudents(config, input);
  console.log(`Stage: fetching ${service} data:\n`);
  const results = await getDataFromService(config, students);

  console.log('\nStage: writing to file');
  writeStudentResults(service, results, output, 'xlsx');
};
