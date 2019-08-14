import googleSpreadsheet from '../types/google-spreadsheet';
import gssCredsJson from '../../gss-creds.json';
import { filterLogin } from '../utils/text-utils';
import { Result } from '../interfaces';
import logger from '../utils/logger';

const setAuth = (document: googleSpreadsheet) => {
  return new Promise((resolve, reject) => {
    try {
      document.useServiceAccountAuth(gssCredsJson, resolve);
    } catch (err) {
      console.log(err);
      reject(err);
    }
  });
};

const getWorksheet = (document: googleSpreadsheet) => {
  return new Promise((resolve, reject) => {
    document.getInfo((err: Error, info: any) => {
      if (err) {
        console.log(err);
        reject();
      }

      const sheet = info.worksheets[0];
      resolve(sheet);
    });
  });
};

const getRows = (sheet: any) => {
  return new Promise((resolve, reject) => {
    sheet.getRows({}, (err: Error, rows: any) => {
      if (err) {
        console.log(err);
        reject(err);
      }

      resolve(rows);
    });
  });
};

export const getScores = async (id: string) => {
  const document = new googleSpreadsheet(id);

  await setAuth(document);

  const sheet: any = await getWorksheet(document);
  const rows: any = await getRows(sheet);

  const scores: any = rows.map((row: any) => {
    const github =
      row['github'] ||
      row['githublogin'] ||
      row['githublink'] ||
      row['githuburl'] ||
      row['githubusername'] ||
      '';

    if (!github) {
      logger.push({
        description: 'Empty github login',
      });
    }

    return {
      score: parseInt(row.score, 10),
      github: filterLogin(github).toLowerCase(),
    };
  });

  return scores.filter((score: Result) => !!score.github);
};
