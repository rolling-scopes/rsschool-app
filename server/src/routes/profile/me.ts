import { BAD_REQUEST, OK } from 'http-status-codes';
import * as Router from 'koa-router';
import { getRepository } from 'typeorm';
import { ILogger } from '../../logger';
import { User } from '../../models';
import { IUserSession } from '../../models/session';
import { EducationRecord, EmploymentRecord } from './../../models/user';
import { setResponse } from '../utils';
import { getProfileByGithubId } from './user';

export const getMyProfile = (_: ILogger) => async (ctx: Router.RouterContext) => {
  const githubId = ctx.state.user.githubId.toLowerCase();
  await getProfileByGithubId(ctx, githubId, true);
};

type RegistryInput = {
  firstName?: string;
  lastName?: string;
  firstNameNative?: string;
  lastNameNative?: string;
  dateOfBirth?: string;
  locationName?: string;
  contactsPhone?: string;
  contactsEmail?: string;
  contactsEpamEmail?: string;
  educationHistory?: [EducationRecord];
  employmentHistory?: [EmploymentRecord];
};

export const updateMyProfile = (_: ILogger) => async (ctx: Router.RouterContext) => {
  const sessionUser = ctx.state!.user as IUserSession;
  const inputData: User = ctx.request.body;
  if (!inputData) {
    setResponse(ctx, BAD_REQUEST);
    return;
  }
  const userRepository = getRepository(User);
  const user = await userRepository.findOne({ where: { githubId: sessionUser.githubId } });
  if (!user) {
    setResponse(ctx, BAD_REQUEST);
    return;
  }
  const { id, githubId, ...other } = inputData;
  const updatedUser = { ...user, ...other };
  const result = await userRepository.save(updatedUser);
  setResponse(ctx, OK, result);
};

export const updateProfileByRegistry = (_: ILogger) => async (ctx: Router.RouterContext) => {
  const { githubId } = ctx.state!.user as IUserSession;
  const inputData: RegistryInput = ctx.request.body;
  if (!inputData) {
    setResponse(ctx, BAD_REQUEST);
    return;
  }
  const userRepository = getRepository(User);
  const user = await userRepository.findOne({ where: { githubId } });
  if (!user) {
    setResponse(ctx, BAD_REQUEST);
    return;
  }
  const result = await userRepository.save({ ...user, ...inputData });
  setResponse(ctx, OK, { id: result.id });
};
