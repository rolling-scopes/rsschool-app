import Router from '@koa/router';
import { ILogger } from '../../logger';
import { config } from '../../config';
import { Consent } from '../../models';
import { OK, INTERNAL_SERVER_ERROR, UNAUTHORIZED, BAD_REQUEST } from 'http-status-codes';
import { setResponse, setErrorResponse } from '../utils';
import { consentService } from '../../services';

export function consentRoute(_: ILogger) {
  const router = new Router({ prefix: '/consent' });
  router.post('/capture', async (ctx: Router.RouterContext) => {
    const key = ctx.headers['consent-secret'];
    if (key !== config.auth.consentSecret) {
      setErrorResponse(ctx, UNAUTHORIZED, 'Invalid access token');
      return;
    }
    const consent: Consent = ctx.request.body;
    const { chatId, username, tg, email }: Consent = consent;
    if (!chatId || !username || !(typeof tg === 'boolean' || typeof email === 'boolean')) {
      setErrorResponse(ctx, BAD_REQUEST, 'Missed required params');
      return;
    }
    try {
      consentService.captureConsent(consent);
      setResponse(ctx, OK, { message: 'Consents has been updated' });
    } catch (e) {
      setErrorResponse(ctx, INTERNAL_SERVER_ERROR, e.message);
      return;
    }
  });
  return router;
}
