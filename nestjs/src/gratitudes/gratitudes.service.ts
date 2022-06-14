import { Feedback } from '@entities/feedback';
import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AuthUser, CourseRole } from 'src/auth';
import { Repository } from 'typeorm';
import { DiscordService } from './discord.service';
import { Badge, CreateGratitudeDto } from './dto';

@Injectable()
export class GratitudesService {
  private logger = new Logger(GratitudesService.name);

  constructor(
    private discordService: DiscordService,
    @InjectRepository(Feedback)
    private repository: Repository<Feedback>,
  ) {}

  public async create(authUser: AuthUser, data: CreateGratitudeDto) {
    if (data.userIds.includes(authUser.id)) {
      throw new BadRequestException('You cannot give feedback to yourself');
    }
    const badges = this.getBadges(authUser, data.courseId);

    if (!badges.some(badge => badge.id === data.badgeId)) {
      throw new BadRequestException('Badge not allowed');
    }

    await Promise.all(
      data.userIds.map(
        async userId =>
          await this.postUserFeedback({
            toUserId: userId,
            fromUserId: authUser.id,
            comment: data.comment,
            badgeId: data.badgeId,
            courseId: data.courseId,
          } as Feedback),
      ),
    );
  }

  public getBadges({ courses, isAdmin }: AuthUser, courseId: number) {
    if (isAdmin) {
      return gratitudeBadge;
    }

    const userCourseRoles = courses ? courses[courseId]?.roles ?? [] : [];
    return gratitudeBadge.filter((badge: GratitudeBadge) => {
      const allowed = badge.roles?.some(role => userCourseRoles.includes(role)) ?? true;
      return allowed;
    });
  }

  private async postUserFeedback(data: Feedback) {
    const feedback = await this.createFeedback(data);
    await this.postToDiscord(feedback);
  }

  private async createFeedback(feedback: Feedback) {
    const { id } = await this.repository.save({
      fromUserId: feedback.fromUserId,
      toUserId: feedback.toUserId,
      comment: feedback.comment,
      badgeId: feedback.badgeId,
      courseId: feedback.courseId,
    });

    const result = await this.repository.findOneOrFail(id, {
      relations: ['fromUser', 'toUser', 'course', 'course.discordServer'],
    });

    return result;
  }

  private postToDiscord(feedback: Feedback) {
    if (!feedback.course?.discordServer?.gratitudeUrl) {
      this.logger.warn('Course do not have Discord Webhook URL');
      return Promise.resolve(null);
    }
    return this.discordService.sendGratitudeMessage({
      toGithubId: feedback.toUser.githubId,
      toDiscordId: feedback.toUser.discord?.id ?? null,
      fromGithubId: feedback.fromUser.githubId,
      comment: feedback.comment ?? '',
      gratitudeUrl: feedback.course.discordServer.gratitudeUrl,
    });
  }
}

type GratitudeBadge = { id: Badge; name: string; roles?: CourseRole[] };

const gratitudeBadge: GratitudeBadge[] = [
  { id: Badge.Congratulations, name: 'Congratulations' },
  { id: Badge.ExpertHelp, name: 'Expert help' },
  { id: Badge.GreatSpeaker, name: 'Great speaker' },
  { id: Badge.GoodJob, name: 'Good job' },
  { id: Badge.HelpingHand, name: 'Helping hand' },
  { id: Badge.Hero, name: 'Hero' },
  { id: Badge.ThankYou, name: 'Thank you' },
  { id: Badge.OutstandingWork, name: 'Outstanding work', roles: [CourseRole.Manager, CourseRole.Supervisor] },
  { id: Badge.TopPerformer, name: 'Top performer', roles: [CourseRole.Manager, CourseRole.Supervisor] },
  { id: Badge.JobOffer, name: 'Job Offer', roles: [CourseRole.Manager, CourseRole.Supervisor] },
  { id: Badge.RSActivist, name: 'RS activist', roles: [CourseRole.Manager, CourseRole.Supervisor] },
];
