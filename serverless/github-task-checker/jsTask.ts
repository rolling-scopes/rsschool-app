import { exec } from 'child_process';
import * as fs from 'fs';
import * as https from 'https';
import * as unzipper from 'unzipper';
import { TaskEvent } from './handler';

interface TestResult {
  passed: number;
  failed: any;
  time: string;
  exitCode: number;
}

interface StudentInfo {
  githubId: string;
}

interface RepositoryInfo {
  name: string;
}

const download = async (url: string, dest: string, cb: Function): Promise<any> => {
  const file = fs.createWriteStream(dest);
  https
    .get(url, function(response) {
      response.pipe(file);
      file.on('finish', async function() {
        if (file.bytesWritten === '404: Not Found'.length + 1) throw 'file not found';
        file.close();
        cb();
      });
    })
    .on('error', function(err) {
      fs.unlink(dest, () => {});
      if (cb) cb(err.message);
    });
};

const mkDir = (dir: string): void => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
  }
};

const testRunner = (path: string, result: TestResult): Promise<any> => {
  return new Promise(resolve => {
    const command_install = `cd ${path} && ls -d $PWD/*  && export HOME=/tmp && npm install`;
    //const childInstallModules =
    exec(command_install).on('exit', (/* code */) => {
      const command_run_test = `cd ${path} && export PATH=$PATH:$PWD/node_modules/mocha/bin && npm test`;
      const childRunTests = exec(command_run_test).on('exit', code => {
        result.exitCode = code || 0;
        resolve(result);
      });
      childRunTests.stdout.on('data', data => {
        let passing = data.match(/(\d*) passing \((\d*.+)\)/);
        let failed = data.match(/(\d*) failing/);
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

export const worker = (event: TaskEvent): Promise<string> => {
  return new Promise(resolve => {
    const githubId: string = event.githubId;
    const repositoryName: string = event.task.repositoryName;
    const url: string = `https://codeload.github.com/${githubId}/${repositoryName}/zip/master`;
    const tempDir: string = `/tmp/${githubId}`;
    const dest: string = `${tempDir}/${repositoryName}.zip`;
    const extractedFolder: string = `${dest.slice(0, -4)}-master`;

    const result: TestResult = {
      passed: 0,
      failed: null,
      time: '',
      exitCode: 0,
    };

    mkDir(tempDir);
    download(url, dest, function() {
      fs.createReadStream(dest)
        .pipe(unzipper.Extract({ path: tempDir }))
        .on('close', async () => {
          testRunner(extractedFolder, result).then(res => resolve(res));
        });
    });
  });
};
