import { OK, BAD_REQUEST, INTERNAL_SERVER_ERROR } from 'http-status-codes';
import Router from 'koa-router';
import { getRepository } from 'typeorm';
import { ILogger } from '../../logger';
import { ProfilePermissions, User } from '../../models';
import { SaveProfileInfo } from '../../../../common/models/profile';
import { IUserSession } from '../../models/session';
import { setResponse } from '../utils';

export const updateProfile = (_: ILogger) => async (ctx: Router.RouterContext) => {
  const { id: userId } = ctx.state!.user as IUserSession;
  const profileInfo: SaveProfileInfo = ctx.request.body;

  if (!profileInfo) {
    setResponse(ctx, BAD_REQUEST);
    return;
  }

  const {
    isPermissionsSettingsChanged,
    isProfileSettingsChanged,
    permissionsSettings,
    contacts,
    generalInfo,
  } = profileInfo;

  try {
    if (isPermissionsSettingsChanged) {
      const profileRepository = await getRepository(ProfilePermissions);
      const userPermissions = (await profileRepository.findOne({ where: { userId } }));

      await profileRepository.save({
        id: userPermissions ? userPermissions.id : undefined,
        userId,
        ...permissionsSettings,
      });
    }

    if (isProfileSettingsChanged) {
      const [firstName, lastName = ''] = generalInfo.name.split(' ');
      const { locationId, aboutMyself, locationName, educationHistory, englishLevel } = generalInfo;
      const { skype, phone, email, telegram, notes} = contacts;
      await getRepository(User)
        .createQueryBuilder()
        .update(User)
        .set({
          firstName,
          lastName,
          locationName,
          locationId,
          educationHistory,
          englishLevel: englishLevel || 'a0',
          aboutMyself: aboutMyself || '',
          contactsTelegram: telegram || '',
          contactsPhone: phone || '',
          contactsEmail: email || '',
          contactsNotes: notes || '',
          contactsSkype: skype || '',
        })
        .where('id = :id', { id: userId })
        .execute();
    }

    setResponse(ctx, OK);
  } catch (error) {
    setResponse(ctx, INTERNAL_SERVER_ERROR);
  }
};
