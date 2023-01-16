import { getRepository } from 'typeorm';
import { UserInfo } from '../../../../common/models/profile';
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
    isWhatsAppVisible,
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
    query.addSelect('"user"."contactsEmail" AS "contactsEmail"').addSelect('"user"."contactsEpamEmail" AS "epamEmail"');
  }

  if (isTelegramVisible) {
    query.addSelect('"user"."contactsTelegram" AS "contactsTelegram"');
  }

  if (isSkypeVisible) {
    query.addSelect('"user"."contactsSkype" AS "contactsSkype"');
  }

  if (isWhatsAppVisible) {
    query.addSelect('"user"."contactsWhatsApp" AS "contactsWhatsApp"');
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

  if (rawUser == null) {
    throw new Error(`User with githubId ${githubId} not found`);
  }

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
    contactsWhatsApp = null,
    contactsNotes = null,
    contactsLinkedIn = null,
    aboutMyself = null,
    epamEmail = null,
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
          epamEmail,
          skype: contactsSkype,
          telegram: contactsTelegram,
          notes: contactsNotes,
          linkedIn: contactsLinkedIn,
          whatsApp: contactsWhatsApp,
        }
      : undefined,
  };
};
