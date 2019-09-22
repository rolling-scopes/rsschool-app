import { SQSEvent, SQSHandler } from 'aws-lambda';
import { exec } from 'child_process';
import axios from 'axios';
import fse from 'fs-extra';
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

const download = async (url: string, dest: string) => {
  console.info('start downloading', url);
  return new Promise<void>((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https
      .get(url, function(response) {
        response.pipe(file);
        file.on('error', err => {
          reject(err.message);
        });
        file.on('finish', async () => {
          if (file.bytesWritten === '404: Not Found'.length + 1) throw `Repository ${url} not found`;
          file.close();
          resolve();
        });
      })
      .on('error', err => {
        fs.unlink(dest, () => {});
        reject(err.message);
      });
  });
};

const mkDir = (dir: string): void => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

const testRunner = (path: string, result: TestResult) => {
  return new Promise<TestResult>(resolve => {
    console.info(`Running tests in ${path}`);
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

const worker = async (event: TaskEvent): Promise<TestResult> => {
  const githubId: string = event.githubId;
  const githubRepoName: string = (event.courseTask as JsTask).githubRepoName;
  const sourceGithubRepoUrl: string = (event.courseTask as JsTask).sourceGithubRepoUrl;

  const codeGithubAccount = githubId;
  const codeRepo = `${githubId}/${githubRepoName}`;
  const codeUrl: string = `https://codeload.github.com/${codeRepo}/zip/master`;
  const codeTempDir = `/tmp/${codeGithubAccount}`;
  const codeDest = `/tmp/${codeRepo}.zip`;
  const codeExtractedFolder = `${codeDest.slice(0, -4)}-master`;

  const sourceRepo = sourceGithubRepoUrl.replace('https://github.com/', '');
  const [sourceGithubAccount] = sourceRepo.split('/');
  const sourceUrl = `https://codeload.github.com/${sourceRepo}/zip/master`;
  const sourceTempDir = `/tmp/${sourceGithubAccount}`;
  const sourceDest = `/tmp/${sourceRepo}.zip`;
  const sourceExtractedFolder = `${sourceDest.slice(0, -4)}-master`;

  const result: TestResult = {
    passed: 0,
    failed: 0,
    time: '',
    exitCode: 0,
  };

  console.info(`creating ${codeTempDir}`);
  mkDir(codeTempDir);
  console.info(`creating ${sourceTempDir}`);
  mkDir(sourceTempDir);
  await Promise.all([
    download(codeUrl, codeDest).then(() => extract(codeDest, codeTempDir)),
    !fs.existsSync(sourceDest)
      ? download(sourceUrl, sourceDest).then(() => extract(sourceDest, sourceTempDir))
      : Promise.resolve(),
  ]);
  fse.removeSync(`/tmp/task`);
  fse.copySync(sourceExtractedFolder, `/tmp/task`);
  fse.copySync(`${codeExtractedFolder}/src`, `/tmp/task/src`, { overwrite: true });

  const res = await testRunner(`/tmp/task`, result);
  return res;
};

const extract = (filePath: string, dest: string) => {
  console.info(`extracting ${filePath} to ${dest}`);
  return new Promise<void>((resolve, reject) => {
    fs.createReadStream(filePath)
      .pipe(unzipper.Extract({ path: dest }))
      .on('error', () => reject())
      .on('close', () => resolve());
  });
};

export const handler: SQSHandler = async (event: SQSEvent) => {
  const [record] = event.Records;
  const data: TaskEvent = JSON.parse(record.body);
  const requestConfig = {
    headers: { Authorization: process.env.RS_APP_AUTHORIZATION },
  };
  try {
    const { passed, failed } = await worker(data);
    const total = passed + failed;
    const score = passed > 0 ? Math.round((passed / total) * 100) : 0;
    const result = {
      score,
      studentId: data.studentId,
      courseTaskId: data.courseTask.id,
    };
    await Promise.all([
      axios.post(`https://app.rs.school/api/taskResult`, result, requestConfig),
      axios
        .post(
          `https://app.rs.school/api/task-verification`,
          {
            courseTaskId: result.courseTaskId,
            studentId: result.studentId,
            details: `Passed: ${passed}. Failed: ${failed}`,
            score,
            status: 'success',
          },
          requestConfig,
        )
        .catch(e => {
          console.error(e);
        }),
    ]);
  } catch (e) {
    const result = {
      courseTaskId: data.courseTask.id,
      studentId: data.studentId,
      details: `Error: ${e.message}`,
      score: 0,
      status: 'error',
    };
    axios.post(`https://app.rs.school/api/task-verification`, result, requestConfig).catch(e => {
      console.error(e);
    });
  }
};
