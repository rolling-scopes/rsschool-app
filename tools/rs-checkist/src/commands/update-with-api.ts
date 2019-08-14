import services from '../constants/services';
import { getDataFromService } from '../utils/parse-utils';
import { writeStudentResults } from '../utils/file-utils';
import { getStudents, prepareScores, updateScores } from '../utils/rsschool-api-utils';
import { Student } from '../interfaces';
import logger from '../utils/logger';

export default async (service: string, output?: string) => {
  const config = services[service];

  if (!config) {
    return console.log('Undefined service name!');
  }

  console.log('Stage: fetching students from RS School API');
  const students = (await getStudents(service)).filter((student: Student) => {
    if (!student.serviceLogin) {
      logger.push({
        description: `Empty ${service} login`,
        githubLogin: student.githubLogin,
        serviceLogin: student.serviceLogin,
      });
    }

    return student.serviceLogin;
  });

  console.log(`Stage: fetching ${service} data:\n`);
  const results = await getDataFromService(config, students);

  const scores = await prepareScores(config, results);

  console.log('\nStage: updating scores');
  const updateResult = await updateScores(JSON.stringify(scores));

  console.log('Job\'s done!');
  console.log(updateResult);

  if (output) {
    const filename = `${output}errors-`;

    console.log('\nStage: writing logs to file');
    writeStudentResults(service, logger.logs, filename, 'json');
  }
};
