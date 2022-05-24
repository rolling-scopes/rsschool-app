import { Course } from '@entities/course';
import { NotificationUserConnection } from '@entities/notificationUserConnection';
import { ProfilePermissions } from '@entities/profilePermissions';
import { User } from '@entities/user';
import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AuthUser } from 'src/auth';
import { In, IsNull, Not, Repository, UpdateResult } from 'typeorm';
import { UserNotificationsService } from '../users-notifications';
import { ProfileInfoDto, UpdateUserDto } from './dto';
import { isEmail } from 'class-validator';
import { Resume } from '@entities/resume';
import { Discord } from '../../../common/models';

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
  ) {}

  public async getCourses(authUser: AuthUser): Promise<Course[]> {
    const courseIds = Object.keys(authUser.courses).map(Number);

    return this.courseRepository.find({
      where: { id: In(courseIds) },
      order: {
        startDate: 'DESC',
      },
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
      contactsLinkedIn,
      contactsEpamEmail,
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
        contactsLinkedIn,
        contactsEpamEmail,
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
      const { skype, phone, email, epamEmail, telegram, notes, linkedIn } = contacts;
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
