import { omitBy, isUndefined } from 'lodash';
import { Repository } from 'typeorm';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
import { isEmail } from 'class-validator';
import { BadRequestException, ForbiddenException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MentorInfoService } from './mentor-info.service';
import { PermissionsService } from './permissions.service';
import { PublicFeedbackService } from './public-feedback.service';
import { StudentInfoService } from './student-info.service';
import { UserInfoService } from './user-info.service';
import { InterviewsService } from 'src/courses/interviews';
import { ProfileService } from './profile.service';
import { UpdateProfileInfoDto } from './dto';
import { ConfigurableProfilePermissions } from './dto/permissions.dto';
import { User, IUserSession } from '@entities/index';

@Injectable()
export class ProfileInfoService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,

    private interviewsService: InterviewsService,
    private mentorInfoService: MentorInfoService,
    private permissionsService: PermissionsService,
    private publicFeedbackService: PublicFeedbackService,
    private studentInfoService: StudentInfoService,
    private userInfoService: UserInfoService,
    private profileService: ProfileService,
  ) {}

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

    if (contactsEmail && !isEmail(contactsEmail)) {
      throw new BadRequestException('Email is invalid.');
    }
    if (contactsEpamEmail && !isEmail(contactsEpamEmail)) {
      throw new BadRequestException('Epam email is invalid.');
    }

    const [firstName, lastName] = name?.split(' ') ?? [];
    const user = await this.userRepository
      .createQueryBuilder()
      .update(User)
      .set(
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
      )
      .returning('*')
      .where('id = :id', { id: userId })
      .execute();

    await Promise.all([
      this.profileService.updateEmailChannel(userId, user),
      this.profileService.updateDiscordChannel(userId, user),
    ]);
  }

  public async getProfileInfo(requestedGithubId: string, requestorGithubId: string, requestor: IUserSession) {
    const isProfileOwner = requestedGithubId === requestorGithubId;
    const requestedProfilePermissions = await this.permissionsService.getProfilePermissions(requestedGithubId);
    const accessRights = isProfileOwner
      ? this.permissionsService.getAccessRights({ isProfileOwner: true, isAdmin: requestor.isAdmin })
      : await this.getForeignAccessRights({
          requestedProfilePermissions,
          requestedGithubId,
          requestorGithubId,
          requestor,
        });
    const {
      isProfileVisible,
      isPublicFeedbackVisible,
      isMentorStatsVisible,
      isStudentStatsVisible,
      isStageInterviewFeedbackVisible,
    } = accessRights;

    if (!isProfileOwner && !isProfileVisible) {
      throw new ForbiddenException();
    }

    const { generalInfo, contacts, discord } = await this.userInfoService.getUserInfo(requestedGithubId, accessRights);
    const [permissionsSettings, mentorStats, studentStats, publicFeedback, stageInterviewFeedback] = await Promise.all([
      isProfileOwner ? this.permissionsService.getProfilePermissionsSettings(requestedProfilePermissions) : undefined,
      isMentorStatsVisible ? this.mentorInfoService.getStats(requestedGithubId) : undefined,
      isStudentStatsVisible ? this.studentInfoService.getStats(requestedGithubId, accessRights) : undefined,
      isPublicFeedbackVisible ? this.publicFeedbackService.getFeedback(requestedGithubId) : undefined,
      isStageInterviewFeedbackVisible ? this.interviewsService.getStageInterviewFeedback(requestedGithubId) : undefined,
    ]);

    return {
      permissionsSettings,
      generalInfo,
      contacts,
      discord,
      mentorStats,
      publicFeedback,
      stageInterviewFeedback,
      studentStats,
    };
  }

  private async getForeignAccessRights({
    requestedProfilePermissions,
    requestedGithubId,
    requestorGithubId,
    requestor,
  }: {
    requestedProfilePermissions: ConfigurableProfilePermissions;
    requestedGithubId: string;
    requestorGithubId: string;
    requestor: IUserSession;
  }) {
    const relationsRoles = await this.permissionsService.getRelationsRoles(requestorGithubId, requestedGithubId);
    const [studentCourses, mentorRegistryCourses] = relationsRoles
      ? [null, null]
      : await Promise.all([
          this.studentInfoService.getCourses(requestedGithubId),
          this.mentorInfoService.getRegistryCourses(requestedGithubId),
        ]);
    const requestorRole = this.permissionsService.defineRole({
      relationsRoles,
      studentCourses,
      mentorRegistryCourses,
      userSession: requestor,
      userGithubId: requestorGithubId,
    });

    return this.permissionsService.getAccessRights({
      isProfileOwner: false,
      isAdmin: requestor.isAdmin,
      permissions: requestedProfilePermissions,
      role: requestorRole,
    });
  }
}
