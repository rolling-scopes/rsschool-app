import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UsersService } from 'src/users/users.service';
import { Permissions } from './dto/permissions.dto';
import { UserInfo } from '@common/models';
import { User } from '@entities/index';

@Injectable()
export class UserInfoService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private userService: UsersService,
  ) {}

  async getUserInfo(githubId: string, permissions: Permissions): Promise<UserInfo> {
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

    const query = this.userRepository
      .createQueryBuilder('user')
      .select('"user"."firstName" AS "firstName", "user"."lastName" AS "lastName"')
      .addSelect('"user"."githubId" AS "githubId"')
      .addSelect('"user"."countryName" AS "countryName"')
      .addSelect('"user"."cityName" AS "cityName"')
      .addSelect('"user"."discord" AS "discord"')
      .addSelect('"user"."languages" AS "languages"');

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
      query
        .addSelect('"user"."contactsEmail" AS "contactsEmail"')
        .addSelect('"user"."contactsEpamEmail" AS "epamEmail"');
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
      languages = [],
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
        name: this.userService.getFullName({ firstName, lastName }) || githubId,
        languages,
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
  }
}
