import commander from 'commander';
import services from '../constants/services';
import { getDataFromService } from '../utils/parse-utils';
import { writeStudentResults } from '../utils/file-utils';
import { getStudents, prepareScores, setUpCourseId } from '../utils/rsschool-api-utils';
import { Student } from '../interfaces';
import logger from '../utils/logger';

export default (callback: Function) => async (service: string, altTaskName: string) => {
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

  let specificStudents: string[] = [];
  if (commander.students) {
    specificStudents = commander.students.toLowerCase().split(',');
  }

  console.log('Stage: fetching students from RS School API');
  let students = (await getStudents(service))
    .filter((student: Student) => {
      if (!student.serviceLogin) {
        logger.push({
          description: `Empty ${service} login`,
          githubLogin: student.githubLogin,
          serviceLogin: student.serviceLogin,
        });
      }

      return student.serviceLogin;
    });

  if (specificStudents.length > 0) {
    students = students.filter(
      (student: Student) => specificStudents.includes(student.githubLogin),
    );
  }

  console.log(`Stage: fetching ${service} data:\n`);
  const results = await getDataFromService(config, students);

  const scores = await prepareScores(config, results, altTaskName);

  if (commander.errorLogPath) {
    const filename = `${commander.errorLogPath}errors-`;

    console.log('\nStage: writing logs to file');
    writeStudentResults(service, logger.logs, filename, 'json');
  }

  await callback(scores);

  if (commander.output) {
    console.log('\nStage: writing to file');
    writeStudentResults(service, scores, commander.output, 'json');
  }

  console.log('\nJob\'s done!');
};
