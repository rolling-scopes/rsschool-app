import Router from '@koa/router';
import { ILogger } from '../../logger';
import { Consent } from '../../models';
import { OK, INTERNAL_SERVER_ERROR, BAD_REQUEST } from 'http-status-codes';
import { setResponse, setErrorResponse } from '../utils';
import { basicAuthAws } from '../guards';
import { ConsentRepository } from '../../repositories/consent.repository';
import { getCustomRepository } from 'typeorm';

export function consentRoute(_: ILogger) {
  const router = new Router<any, any>({ prefix: '/consent' });
  router.post('/capture', basicAuthAws, async (ctx: Router.RouterContext) => {
    const consent: Consent = ctx.request.body;
    const { channelType, channelValue, optIn }: Consent = consent;
    if (!channelType || !channelValue || typeof optIn !== 'boolean') {
      setErrorResponse(ctx, BAD_REQUEST, 'Missed required params');
      return;
    }
    try {
      await getCustomRepository(ConsentRepository).saveConsents([consent]);
      setResponse(ctx, OK, { message: 'Consents has been updated' });
    } catch (e) {
      setErrorResponse(ctx, INTERNAL_SERVER_ERROR, e.message);
      return;
    }
  });
  return router;
}
