import Router from '@koa/router';
import { StatusCodes } from 'http-status-codes';
import { parseAsync } from 'json2csv';
import { ILogger } from '../../../logger';
import { MentorService } from '../../../services/mentor.service';
import { setCsvResponse } from '../../utils';

export const getMentorsDetailsCsv = (logger: ILogger) => async (ctx: Router.RouterContext) => {
  const courseId: number = ctx.params.courseId;
  const service = new MentorService(courseId, logger);
  const result = await service.getMentorsWithStats();
  const csv = await parseAsync(result);
  setCsvResponse(ctx, StatusCodes.OK, csv);
};
