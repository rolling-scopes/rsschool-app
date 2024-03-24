import { In, IsNull, Not, Repository, UpdateResult } from 'typeorm';
import { nanoid } from 'nanoid';
import { isEmail } from 'class-validator';
import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AuthUser } from 'src/auth';
import { UserNotificationsService } from 'src/users-notifications';
import { UpdateProfileDto, UpdateUserDto } from './dto';
import { Discord } from '@common/models';
import { Certificate, Course, NotificationUserConnection, ProfilePermissions, Resume, User } from '@entities/index';

@Injectable()
export class ProfileService {
  constructor(
    @InjectRepository(Course)
    private courseRepository: Repository<Course>,
    @InjectRepository(NotificationUserConnection)
    private notificationConnectionsRepository: Repository<NotificationUserConnection>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Certificate)
    private certificateRepository: Repository<Certificate>,
    @InjectRepository(Resume)
    private resumeRepository: Repository<Resume>,
    @InjectRepository(ProfilePermissions)
    private profilePermissionsRepository: Repository<ProfilePermissions>,
    private userNotificationsService: UserNotificationsService,
  ) {}

  public async getCourses(authUser: AuthUser): Promise<Course[]> {
    const courseIds = Object.keys(authUser.courses).map(Number);

    return this.courseRepository.find({
      cache: 120 * 1000,
      where: { id: In(courseIds) },
      order: {
        startDate: 'DESC',
      },
      relations: ['discipline'],
    });
  }

  public async updateUser(userId: number, userDto: UpdateUserDto) {
    const {
      firstName,
      lastName,
      countryName,
      cityName,
      contactsTelegram,
      contactsPhone,
      contactsEmail,
      contactsNotes,
      contactsSkype,
      contactsWhatsApp,
      contactsLinkedIn,
      contactsEpamEmail,
      aboutMyself,
      languages,
    } = userDto;

    await this.userRepository
      .createQueryBuilder()
      .update(User)
      .set({
        firstName,
        lastName,
        countryName,
        cityName,
        contactsTelegram,
        contactsPhone,
        contactsEmail,
        contactsNotes,
        contactsSkype,
        contactsWhatsApp,
        contactsLinkedIn,
        contactsEpamEmail,
        aboutMyself,
        languages,
      })
      .returning('*')
      .where('id = :id', { id: userId })
      .execute();
  }

  public async updateProfile(userId: number, profileInfo: UpdateProfileDto) {
    const {
      isPermissionsSettingsChanged,
      isProfileSettingsChanged,
      permissionsSettings,
      contacts,
      discord,
      generalInfo,
    } = profileInfo;

    if (isPermissionsSettingsChanged) {
      const userPermissions = await this.profilePermissionsRepository.findOne({ where: { userId } });

      await this.profilePermissionsRepository.save({
        id: userPermissions?.id,
        userId,
        ...permissionsSettings,
      });
    }

    if (isProfileSettingsChanged) {
      const [firstName, lastName = ''] = generalInfo.name.split(' ');
      const { location, aboutMyself, educationHistory, englishLevel } = generalInfo;
      const { skype, whatsApp, phone, email, epamEmail, telegram, notes, linkedIn } = contacts;
      const { countryName, cityName } = location;
      if (email && !isEmail(email)) {
        throw new BadRequestException('Email is invalid.');
      }
      if (epamEmail && !isEmail(epamEmail)) {
        throw new BadRequestException('Epam email is invalid.');
      }

      const user = await this.userRepository
        .createQueryBuilder()
        .update(User)
        .set({
          firstName,
          lastName,
          countryName,
          cityName,
          educationHistory: educationHistory ?? [],
          discord,
          englishLevel: englishLevel || 'a0',
          aboutMyself: aboutMyself || '',
          contactsTelegram: telegram || '',
          contactsPhone: phone || '',
          contactsEmail: email || '',
          contactsNotes: notes || '',
          contactsSkype: skype || '',
          contactsWhatsApp: whatsApp || '',
          contactsLinkedIn: linkedIn || '',
          contactsEpamEmail: epamEmail || '',
        })
        .returning('*')
        .where('id = :id', { id: userId })
        .execute();

      await Promise.all([this.updateEmailChannel(userId, user), this.updateDiscordChannel(userId, user)]);
    }
  }

  public async getProfile(githubId: string) {
    const user = await this.userRepository.findOneOrFail({ where: { githubId } });
    const resume = await this.resumeRepository.findOne({
      where: { userId: user.id, name: Not(IsNull()) },
    });

    return { resume: resume ?? null };
  }

  public async getPersonalProfile(githubId: string) {
    return this.userRepository.findOneOrFail({ where: { githubId }, relations: ['students'] });
  }

  public async updateEmailChannel(userId: number, user: UpdateResult) {
    const newEmail = user.raw[0]?.contactsEmail;
    const channelId = 'email';

    if (!newEmail) {
      await this.notificationConnectionsRepository.delete({
        channelId,
        userId,
      });
    } else {
      const connection = await this.notificationConnectionsRepository.findOne({
        where: {
          channelId,
          userId,
        },
      });
      const shouldSendEmailConfirmation = !connection || connection.externalId !== newEmail;
      if (shouldSendEmailConfirmation) {
        await this.userNotificationsService.sendEmailConfirmation(userId, false);
      }

      const isConfirmed = connection?.enabled && connection?.externalId === newEmail ? true : false;
      await this.notificationConnectionsRepository.save({
        channelId,
        userId,
        externalId: newEmail,
        enabled: isConfirmed,
      });
    }
  }

  public async updateDiscordChannel(userId: number, user: UpdateResult) {
    const newDiscord: Discord = user.raw[0]?.discord;
    const channelId = 'discord';
    if (!newDiscord) {
      await this.notificationConnectionsRepository.delete({
        channelId,
        userId,
      });
    } else {
      const connection = await this.notificationConnectionsRepository.findOne({
        where: {
          channelId,
          userId,
        },
      });

      if (!connection || connection.externalId !== `${newDiscord.id}`) {
        await this.notificationConnectionsRepository.save({
          channelId,
          userId,
          externalId: `${newDiscord.id}`,
          enabled: true,
        });
      }
    }
  }

  public async obfuscateProfile(githubId: string) {
    const user = await this.userRepository.findOneOrFail({ where: { githubId }, relations: ['students'] });

    await this.userRepository.update(user.id, {
      obfuscated: true,
      aboutMyself: null,
      activist: false,
      cityName: null,
      contactsEmail: null,
      contactsEpamEmail: null,
      contactsLinkedIn: null,
      contactsNotes: null,
      contactsPhone: null,
      contactsSkype: null,
      contactsTelegram: null,
      contactsWhatsApp: null,
      countryName: null,
      cvLink: null,
      dateOfBirth: null,
      discord: null,
      educationHistory: [],
      employmentHistory: [],
      englishLevel: null,
      epamApplicantId: null,
      externalAccounts: [],
      firstName: 'Removed',
      firstNameNative: null,
      githubId: `gdpr-${nanoid(10)}`.toLowerCase(),
      languages: [],
      lastName: 'Removed',
      lastNameNative: null,
      locationId: null,
      locationName: null,
      militaryService: null,
      opportunitiesConsent: false,
      primaryEmail: null,
      providerUserId: null,
      tshirtFashion: null,
      tshirtSize: null,
    });

    await this.notificationConnectionsRepository.delete({ userId: user.id });
    await this.resumeRepository.delete({ userId: user.id });

    for (const student of user.students ?? []) {
      await this.certificateRepository.delete({ studentId: student.id });
    }
  }
}
