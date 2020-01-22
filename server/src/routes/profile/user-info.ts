import { getRepository } from 'typeorm';
import { UserInfo } from '../../../../common/models/profile';
import { getFullName } from '../../lib/utils';
import { User } from '../../models';
import { Permissions } from './permissions';

export const getUserInfo = async (githubId: string, permissions: Permissions): Promise<UserInfo> => {
  const {
    isAboutVisible,
    isEducationVisible,
    isEnglishVisible,
    isPhoneVisible,
    isEmailVisible,
    isTelegramVisible,
    isSkypeVisible,
    isContactsNotesVisible,
  } = permissions;

  const query = await getRepository(User)
    .createQueryBuilder('user')
    .select('"user"."firstName" AS "firstName", "user"."lastName" AS "lastName"')
    .addSelect('"user"."githubId" AS "githubId"')
    .addSelect('"user"."locationName" AS "locationName"');

  if (isEducationVisible) {
    query.addSelect('"user"."educationHistory" AS "educationHistory"');
  }

  if (isEnglishVisible) {
    query.addSelect('"user"."englishLevel" AS "englishLevel"');
  }

  if (isPhoneVisible) {
    query.addSelect('"user"."contactsPhone" AS "contactsPhone"');
  }

  if (isEmailVisible) {
    query.addSelect('"user"."contactsEmail" AS "contactsEmail"');
  }

  if (isTelegramVisible) {
    query.addSelect('"user"."contactsTelegram" AS "contactsTelegram"');
  }

  if (isSkypeVisible) {
    query.addSelect('"user"."contactsSkype" AS "contactsSkype"');
  }

  if (isContactsNotesVisible) {
    query.addSelect('"user"."contactsNotes" AS "contactsNotes"');
  }

  if (isAboutVisible) {
    query.addSelect('"user"."aboutMyself" AS "aboutMyself"');
  }

  const rawUser = await query
    .where('"user"."githubId" = :githubId', { githubId })
    .getRawOne();

  const {
    firstName,
    lastName,
    locationName,
    educationHistory,
    englishLevel,
    contactsPhone,
    contactsEmail,
    contactsTelegram,
    contactsSkype,
    contactsNotes,
    aboutMyself,
  } = rawUser;

  return {
    generalInfo: {
      githubId,
      aboutMyself,
      locationName,
      educationHistory,
      englishLevel,
      name: getFullName(firstName, lastName, githubId),
    },
    contacts: contactsPhone || contactsEmail || contactsSkype || contactsTelegram || contactsNotes ? {
      phone: contactsPhone,
      email: contactsEmail,
      skype: contactsSkype,
      telegram: contactsTelegram,
      notes: contactsNotes,
    } : undefined,
  };
};
