import Router from 'koa-router';
import { setResponse } from './utils';
import { BAD_REQUEST, FORBIDDEN } from 'http-status-codes';
const auth = require('basic-auth'); //tslint:disable-line

export const validateGithubIdAndAccess = async (ctx: Router.RouterContext, next: any) => {
  let githubId: string = ctx.params.githubId;
  if (!githubId) {
    setResponse(ctx, BAD_REQUEST, 'Incorrect [githubId]');
    return;
  }
  if (githubId === 'me' && ctx.state.user) {
    githubId = ctx.state.user.githubId;
  } else {
    githubId = githubId.toLowerCase();
  }
  ctx.params.githubId = githubId;
  if ((ctx.state.user != null && ctx.state.user.isAdmin) || auth(ctx)) {
    await next();
    return;
  }
  if (ctx.state.user.githubId !== githubId) {
    setResponse(ctx, FORBIDDEN);
    return;
  }
  await next();
};

export const validateGithubId = async (ctx: Router.RouterContext, next: any) => {
  let githubId: string = ctx.params.githubId;
  if (!githubId) {
    setResponse(ctx, BAD_REQUEST, 'Incorrect [githubId]');
    return;
  }
  if (githubId === 'me' && ctx.state.user) {
    githubId = ctx.state.user.githubId;
  } else {
    githubId = githubId.toLowerCase();
  }
  ctx.params.githubId = githubId;
  await next();
};
