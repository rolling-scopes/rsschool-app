import { BAD_REQUEST, OK } from 'http-status-codes';
import * as Router from 'koa-router';
import { getRepository } from 'typeorm';
import { ILogger } from '../../logger';
import { ExternalAccount, User } from '../../models';
import { IUserSession } from '../../models/session';
import { EducationRecord, EmploymentRecord } from './../../models/user';
import { setResponse } from '../utils';
import { getProfileByGithubId } from './user';

export const getMyProfile = (_: ILogger) => async (ctx: Router.RouterContext) => {
  const githubId = ctx.state.user.githubId.toLowerCase();
  await getProfileByGithubId(ctx, githubId);
};

type UserInput = {
  firstName?: string;
  lastName?: string;
  firstNameNative?: string;
  lastNameNative?: string;
  externalAccounts?: ExternalAccount[];
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
  const { githubId } = ctx.state!.user as IUserSession;
  const inputData: UserInput = ctx.request.body;
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
  if (inputData.firstName) {
    user.firstName = inputData.firstName;
  }
  if (inputData.lastName) {
    user.lastName = inputData.lastName;
  }
  if (inputData.firstNameNative) {
    user.firstNameNative = inputData.firstNameNative;
  }
  if (inputData.lastNameNative) {
    user.lastNameNative = inputData.lastNameNative;
  }
  if (inputData.externalAccounts) {
    user.externalAccounts = inputData.externalAccounts;
  }
  const result = await userRepository.save(user);
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
  setResponse(ctx, OK, result);
};
