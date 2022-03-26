import { Course } from '@entities/course';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AuthUser } from 'src/auth';
import { In, Repository, UpdateResult } from 'typeorm';
import { User } from '@entities/user';
import { NotificationUserConnection } from '@entities/notificationUserConnection';
import { ProfilePermissions } from '@entities/profilePermissions';
import { ProfileInfoDto } from './dto/update-profile.dto';
import { UserNotificationsService } from 'src/usersNotifications/users.notifications.service';

@Injectable()
export class ProfileService {
  constructor(
    @InjectRepository(Course)
    private courseRepository: Repository<Course>,
    @InjectRepository(NotificationUserConnection)
    private notificationConnectionsRepository: Repository<NotificationUserConnection>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
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

      const user = await this.userRepository
        .createQueryBuilder()
        .update(User)
        .set({
          firstName,
          lastName,
          countryName,
          cityName,
          educationHistory,
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

      await this.updateEmailChannel(userId, user);
    }
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
}
