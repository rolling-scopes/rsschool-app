import { QueryParameters } from '../interfaces';
import nodeFetch from 'node-fetch';
import logger from '../utils/logger';
import services from '../constants/services';

export default async (
  token: string,
  queryParameters: QueryParameters,
  linkPrefix: string,
  targetParameter: string,
  callback: Function,
  targetName: string,
  addtitonal: [],
) => {
  const { tokenParameter } = queryParameters;
  const linkPostfix = tokenParameter ? `?${tokenParameter}=${token}` : '';
  const url = `${linkPrefix}${targetParameter.replace('__target__', targetName)}${linkPostfix}`;

  try {
    const isUserTasksData = Boolean(queryParameters.pageParameter);
    let rawData = await (await nodeFetch(url)).json();

    const success = rawData.success || true;

    if (isUserTasksData) {
      const targetData: any[] = [];

      if (!rawData.data || !success) {
        logger.push({
          description: `Wrong responce for ${services.codewars.name} login: ${targetName}`,
          serviceLogin: services.codewars.name,
        });
      }

      targetData.push(...rawData.data);

      if (rawData.totalPages > 1) {
        for (let i = 1; i < rawData.totalPages; i += 1) {
          const nextPageUrl = `${url}&${queryParameters.pageParameter}=${i}`;

          rawData = await (await nodeFetch(nextPageUrl)).json();
          targetData.push(...rawData.data);
        }
      }

      return callback(targetData, ...addtitonal);
    }
    return callback(rawData, ...addtitonal);
  } catch (error) {
    console.log(`Error fetching ${targetName}'s data!\n${error}`);
  }
};
