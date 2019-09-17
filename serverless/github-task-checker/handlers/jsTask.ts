import { SQSEvent, SQSHandler } from 'aws-lambda';
import { exec } from 'child_process';
import axios from 'axios';
import * as fs from 'fs';
import * as https from 'https';
import * as unzipper from 'unzipper';
import { TaskEvent, JsTask } from './submitTask';

interface TestResult {
  passed: number;
  failed: any;
  time: string;
  exitCode: number;
}

const download = async (url: string, dest: string, cb: Function): Promise<any> => {
  const file = fs.createWriteStream(dest);
  https
    .get(url, function(response) {
      response.pipe(file);
      file.on('finish', async () => {
        if (file.bytesWritten === '404: Not Found'.length + 1) throw 'file not found';
        file.close();
        cb();
      });
    })
    .on('error', err => {
      fs.unlink(dest, () => {});
      if (cb) {
        cb(err.message);
      }
    });
};

const mkDir = (dir: string): void => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
  }
};

const testRunner = (path: string, result: TestResult) => {
  return new Promise<TestResult>(resolve => {
    const commandInstall = `cd ${path} && ls -d $PWD/*  && export HOME=/tmp && npm install`;
    exec(commandInstall).on('exit', () => {
      const commandRunTest = `cd ${path} && export PATH=$PATH:$PWD/node_modules/mocha/bin && npm test`;
      const childRunTests = exec(commandRunTest).on('exit', code => {
        result.exitCode = code || 0;
        resolve(result);
      });
      childRunTests.stdout.on('data', data => {
        const cleanData = data.replace(/\x1B/gi, '').replace(/\[(\d+)m/gi, '');
        let passing = cleanData.match(/(\d*) passing\s+\((\d*.+)\)/);
        let failed = cleanData.match(/(\d*) failing/);
        if (passing) {
          result.passed = +passing[1];
          result.time = passing[2];
        }
        if (failed) {
          result.failed = +failed[1];
        }
      });
    });
  });
};

const worker = (event: TaskEvent): Promise<TestResult> => {
  return new Promise((resolve, reject) => {
    const githubId: string = event.githubId;
    const githubRepoName: string = (event.courseTask as JsTask).githubRepoName;
    const url: string = `https://codeload.github.com/${githubId}/${githubRepoName}/zip/master`;
    const tempDir: string = `/tmp/${githubId}`;
    const dest: string = `${tempDir}/${githubRepoName}.zip`;
    const extractedFolder: string = `${dest.slice(0, -4)}-master`;

    const result: TestResult = {
      passed: 0,
      failed: 0,
      time: '',
      exitCode: 0,
    };

    console.info('creating temp dir');
    mkDir(tempDir);
    console.info('start downloading', url);
    download(url, dest, () => {
      fs.createReadStream(dest)
        .pipe(unzipper.Extract({ path: tempDir }))
        .on('error', () => {
          reject();
        })
        .on('close', () => {
          testRunner(extractedFolder, result)
            .then(res => resolve(res))
            .catch(() => reject());
        });
    });
  });
};

export const handler: SQSHandler = async (event: SQSEvent) => {
  const [record] = event.Records;
  const data: TaskEvent = JSON.parse(record.body);
  const { passed, failed } = await worker(data);
  const total = passed + failed;
  const score = passed > 0 ? Math.round((passed / total) * 100) : 0;
  const result = {
    score,
    studentId: data.studentId,
    courseTaskId: data.courseTask.id,
  };
  const requestConfig = {
    headers: {
      Authorization: process.env.RS_APP_AUTHORIZATION,
    },
  };
  await axios.post(`https://app.rs.school/api/taskResult`, result, requestConfig);
};
