import { Course } from '@entities/course';
import { NotificationUserConnection } from '@entities/notificationUserConnection';
import { ProfilePermissions } from '@entities/profilePermissions';
import { EmploymentRecord, User } from '@entities/user';
import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AuthUser } from 'src/auth';
import { In, IsNull, Not, Repository, UpdateResult } from 'typeorm';
import { UserNotificationsService } from '../users-notifications';
import { ProfileInfoDto, UpdateProfileInfoDto, UpdateUserDto } from './dto';
import { isEmail } from 'class-validator';
import { Resume } from '@entities/resume';
import { Discord } from '../../../common/models';
import { omitBy, isUndefined } from 'lodash';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
import { JobFoundDto } from './dto/job-found.dto';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class ProfileService {
  constructor(
    @InjectRepository(Course)
    private courseRepository: Repository<Course>,
    @InjectRepository(NotificationUserConnection)
    private notificationConnectionsRepository: Repository<NotificationUserConnection>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Resume)
    private resumeRepository: Repository<Resume>,
    @InjectRepository(ProfilePermissions)
    private profilePermissionsRepository: Repository<ProfilePermissions>,
    private userNotificationsService: UserNotificationsService,
    private usersService: UsersService,
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

  public async updateProfile(userId: number, profileInfo: ProfileInfoDto) {
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

  public async updateProfileFlat(userId: number, profileInfo: UpdateProfileInfoDto) {
    const {
      name,
      countryName,
      cityName,
      educationHistory,
      discord,
      englishLevel,
      aboutMyself,
      contactsTelegram,
      contactsPhone,
      contactsEmail,
      contactsNotes,
      contactsSkype,
      contactsWhatsApp,
      contactsLinkedIn,
      contactsEpamEmail,
      languages,
    } = profileInfo;

    const [firstName, lastName] = name?.split(' ') ?? [];
    const user = await this.userRepository.update(
      { id: userId },
      omitBy<QueryDeepPartialEntity<User>>(
        {
          firstName,
          lastName: firstName ? lastName ?? '' : undefined,
          countryName,
          cityName,
          educationHistory,
          discord,
          englishLevel,
          aboutMyself,
          contactsTelegram,
          contactsPhone,
          contactsEmail,
          contactsNotes,
          contactsSkype,
          contactsWhatsApp,
          contactsLinkedIn,
          contactsEpamEmail,
          languages,
        },
        isUndefined,
      ),
    );

    await Promise.all([this.updateEmailChannel(userId, user), this.updateDiscordChannel(userId, user)]);
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

  public async getJobFound(userId: number) {
    return JobFoundDto.employmentRecordToJobFound(await this.usersService.getLastEmploymentRecord(userId));
  }

  public async updateJobFound(userId: number, jobFoundDto: JobFoundDto) {
    const employmentRecord = JobFoundDto.jobFoundToEmploymentRecord(jobFoundDto);
    await this.usersService.saveNewEmploymentRecord(userId, employmentRecord);
  }

  private async updateEmailChannel(userId: number, user: UpdateResult) {
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

  private async updateDiscordChannel(userId: number, user: UpdateResult) {
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
}
