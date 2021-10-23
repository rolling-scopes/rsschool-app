import { getRepository } from 'typeorm';
import { UserInfo } from 'common/models/profile';
import { getFullName } from '../../rules';
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
    isLinkedInVisible,
  } = permissions;

  const query = await getRepository(User)
    .createQueryBuilder('user')
    .select('"user"."firstName" AS "firstName", "user"."lastName" AS "lastName"')
    .addSelect('"user"."githubId" AS "githubId"')
    .addSelect('"user"."countryName" AS "countryName"')
    .addSelect('"user"."cityName" AS "cityName"')
    .addSelect('"user"."discord" AS "discord"');

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

  if (isLinkedInVisible) {
    query.addSelect('"user"."contactsLinkedIn" AS "contactsLinkedIn"');
  }

  if (isAboutVisible) {
    query.addSelect('"user"."aboutMyself" AS "aboutMyself"');
  }

  const rawUser = await query.where('"user"."githubId" = :githubId', { githubId }).getRawOne();

  const isContactsVisible =
    isPhoneVisible || isEmailVisible || isTelegramVisible || isSkypeVisible || isContactsNotesVisible;

  const {
    firstName,
    lastName,
    countryName,
    cityName,
    discord,
    educationHistory = null,
    englishLevel = null,
    contactsPhone = null,
    contactsEmail = null,
    contactsTelegram = null,
    contactsSkype = null,
    contactsNotes = null,
    contactsLinkedIn = null,
    aboutMyself = null,
  } = rawUser;

  return {
    generalInfo: {
      githubId,
      location: {
        countryName,
        cityName,
      },
      aboutMyself: isAboutVisible ? aboutMyself : undefined,
      educationHistory: isEducationVisible ? educationHistory : undefined,
      englishLevel: isEnglishVisible ? englishLevel : undefined,
      name: getFullName(firstName, lastName, githubId),
    },
    discord,
    contacts: isContactsVisible
      ? {
          phone: contactsPhone,
          email: contactsEmail,
          skype: contactsSkype,
          telegram: contactsTelegram,
          notes: contactsNotes,
          linkedIn: contactsLinkedIn,
        }
      : undefined,
  };
};
