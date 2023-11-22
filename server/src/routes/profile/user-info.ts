import { getRepository } from 'typeorm';
import { UserInfo } from '../../../../common/models/profile';
import { getFullName } from '../../rules';
import { User } from '../../models';

export const getUserInfo = async (githubId: string, isEpamEmailVisible: boolean): Promise<UserInfo> => {
  const query = await getRepository(User)
    .createQueryBuilder('user')
    .select('"user"."firstName" AS "firstName", "user"."lastName" AS "lastName"')
    .addSelect('"user"."githubId" AS "githubId"')
    .addSelect('"user"."countryName" AS "countryName"')
    .addSelect('"user"."cityName" AS "cityName"')
    .addSelect('"user"."discord" AS "discord"')
    .addSelect('"user"."languages" AS "languages"')
    .addSelect('"user"."educationHistory" AS "educationHistory"')
    .addSelect('"user"."englishLevel" AS "englishLevel"')
    .addSelect('"user"."contactsPhone" AS "contactsPhone"')
    .addSelect('"user"."contactsEmail" AS "contactsEmail"')
    .addSelect('"user"."contactsTelegram" AS "contactsTelegram"')
    .addSelect('"user"."contactsSkype" AS "contactsSkype"')
    .addSelect('"user"."contactsWhatsApp" AS "contactsWhatsApp"')
    .addSelect('"user"."contactsNotes" AS "contactsNotes"')
    .addSelect('"user"."contactsLinkedIn" AS "contactsLinkedIn"')
    .addSelect('"user"."aboutMyself" AS "aboutMyself"');

  if (isEpamEmailVisible) {
    query.addSelect('"user"."contactsEpamEmail" AS "epamEmail"');
  }

  const rawUser = await query.where('"user"."githubId" = :githubId', { githubId }).getRawOne();

  if (rawUser == null) {
    throw new Error(`User with githubId ${githubId} not found`);
  }

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
    languages = [],
  } = rawUser;

  return {
    generalInfo: {
      githubId,
      location: {
        countryName,
        cityName,
      },
      aboutMyself,
      educationHistory,
      englishLevel,
      name: getFullName(firstName, lastName, githubId),
      languages,
    },
    discord,
    contacts: {
      phone: contactsPhone,
      email: contactsEmail,
      epamEmail,
      skype: contactsSkype,
      telegram: contactsTelegram,
      notes: contactsNotes,
      linkedIn: contactsLinkedIn,
      whatsApp: contactsWhatsApp,
    },
  };
};
