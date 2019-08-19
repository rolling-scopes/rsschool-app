import { APIGatewayProxyHandler } from 'aws-lambda';
//import 'source-map-support/register';

import * as fs from 'fs';
import * as https from 'https';
//import * as unzip from 'unzip';
import * as unzipper from 'unzipper';
import { exec } from 'child_process';
/*
interface StudentInfo {
  githubId: string;
}

interface RepositoryInfo {
  name: string;
}

interface Event {
  student: StudentInfo;
  repository: RepositoryInfo;
}


const testData: Event = {
  student: {
    githubId: 'daniil-loban',
  },
  repository: {
    name: 'love-triangle',
  },
};

*/

const debug = (str: string):void => {console.log(str)};

const download = async (url: string, dest: string, cb: Function): Promise<any> => {
  const file = fs.createWriteStream(dest);
  //const request =
  https
    .get(url, function(response) {
      response.pipe(file);
      file.on('finish', async function() {
        if (file.bytesWritten === '404: Not Found'.length + 1) throw 'file not found';
        file.close(); // - zero arguments;
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

interface TestResult {
  passed: number;
  failed: any;
  time: string;
  exitCode: number;
}

const testRunner = (path: string, result: TestResult):Promise<any> => {
  return new Promise((resolve /*, reject */) => {
    debug('install modules...');
    const command_install = `cd ${path} && ls -d $PWD/*  && export HOME=/tmp && npm install`
    
    const childInstallModules = exec(command_install).on('exit', (/* code */) => {
      debug('modules installed');
      debug(`path:${path}`);

      //const ls = exec(`cd ${path} & ls -d $PWD/*`)
      //.stdout.on('data', (data) => {
      //    console.log(`stdout: ${data}`);
      //});

      debug('run tests...');
      const command_run_test = `cd ${path} && export PATH=$PATH:$PWD/node_modules/mocha/bin && npm test`;
      const childRunTests = exec(command_run_test).on('exit', code => {
        result.exitCode = code;
        debug(`tests finished:\n${JSON.stringify(result, null, 2)}`);
        resolve(result);
      });

      childRunTests.stderr.on('data', data => {
        console.log('!@!', data);
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
    childInstallModules.stdout.on('data', (/* data */) => {});
  });
};

const worker = (event: any): Promise<any> => {
  return new Promise((resolve /*, reject */) => {
    const githubId: string = event.student.githubId;
    const repositoryName: string = event.repository.name;
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
    debug('load repository...');
    download(url, dest, function() {
      debug('repository loaded');
      fs.createReadStream(dest)
        .pipe(unzipper.Extract({ path: tempDir}))
        //.pipe(unzip.Extract({ path: tempDir }))
        .on('close', async () => {
          testRunner(extractedFolder, result).then(res => resolve(res));
        });
    });
  });
};



export const hello: APIGatewayProxyHandler = async (event, _context) => {
  const resp = await worker(event);
  debug(`DB Add record:${resp}`);
  return {
    statusCode: 200,
    body: resp
  };

  /*
  return worker(event).then(resp => {
    debug(`DB Add record:${resp}`);
    return {
      statusCode: 200,
      body: resp,
    };
  });
  */

  /*
  return {
    statusCode: 200,
    body: JSON.stringify(
      {
        message: 'Go Serverless Webpack (Typescript) v1.0! Your function executed successfully!',
        input: event,
      },
      null,
      2,
    ),
  };
  */
};

/*
setTimeout(async () => {
  const t = await exports.handler(testData);
  console.log('???', t);
}, 0);
*/
