import nodeXlsx from 'node-xlsx';
import { writeFileSync } from 'fs';
import { Service, Result, Student } from '../interfaces';
import { filterLogin } from './text-utils';

const STUDENTS = 'Students';
const GITHUB = 'Github login';

export const getStudents = (config: Service, filename: string) => {
  try {
    const workSheets = nodeXlsx.parse(filename);

    const { data: [fields, ...arr] }: any = workSheets.find(
      ({ name }: { name: string }) => Boolean(name.match(new RegExp(STUDENTS, 'i'))),
    );

    const { xlsxField = '' } = config;

    const githubLoginIndex: number = fields.findIndex(
      (field: string) => field.match(new RegExp(GITHUB, 'i')),
    );
    const serviceLoginIndex: number = fields.findIndex(
      (field: string) => field.match(new RegExp(xlsxField, 'i')),
    );

    const students = arr
      .filter((item: [string]) => item[githubLoginIndex])
      .map((item: [string]) => ({
        githubLogin: item[githubLoginIndex],
        serviceLogin: filterLogin(item[serviceLoginIndex]),
      }))
      .filter(({ serviceLogin }: Student) => serviceLogin !== '');
    console.log(students);
    return students;
  } catch (error) {
    console.log('Error getting students from file!');
    console.log(error);
  }
};

export const createBuffer = (results: any, serviceName: string, fileType: string) => {
  switch (fileType) {
    case 'xlsx': {
      const formattedResults = results.map((student: Result) => [student.score, student.github]);
      const data = [['Score', 'Github'], ...formattedResults];
      const buffer = nodeXlsx.build([{ data, name: serviceName }]);

      return buffer;
    }

    case 'json': {
      return JSON.stringify(results, null, 2);
    }

    default: {
      console.log('Unexpected type of file! Data wasn\'t written to file!');

      return '';
    }
  }
};

export const writeStudentResults = (
  service: string, results: any, output: string, fileType: string,
) => {
  const date: string = new Date().toISOString().replace(/\.|:/g, '-');
  const filename = `${output || ''}${service}-${date}.${fileType}`;

  const buffer = createBuffer(results, service, fileType);

  try {
    writeFileSync(filename, buffer);
    console.log(`File ${filename} was successfully created!`);
  } catch (error) {
    console.log('Error creating file!', error);
  }
};
