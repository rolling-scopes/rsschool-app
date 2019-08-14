import { QueryParameters } from '../interfaces';
import nodeFetch from 'node-fetch';
import { parse } from 'node-html-parser';

export default async (
  token: string,
  queryParameters: QueryParameters,
  linkPrefix: string,
  targetParameter: string,
  callback: Function,
  targetName: string,
  addtitonal: [],
) => {
  const url = `${linkPrefix}${targetParameter.replace('__target__', targetName)}`;

  try {
    const rawData = await (await nodeFetch(url)).text();
    const dom: any = parse(rawData);

    const skillsTable = dom.querySelectorAll('#completed-body .table-row');
    const skills = skillsTable.map((skill: any) => {
      const name = skill.querySelector('h5.text--ellipsis').childNodes[0].rawText;
      const progressElement = skill.querySelector('.progress__bar__complete');

      let progress = 0;
      if (progressElement) {
        progress = parseInt(progressElement.rawAttrs.match(/([0-9]+%)/g)[0], 10);
      }

      return { name, progress };
    });

    return callback(skills, ...addtitonal);
  } catch (error) {
    console.log(`Error fetching ${targetName}'s data!\n${error}`);
  }
};
