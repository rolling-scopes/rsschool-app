import { Feedback } from '@entities/feedback';
import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AuthUser, CourseRole } from 'src/auth';
import { Repository, DataSource } from 'typeorm';
import { DiscordService } from './discord.service';
import { Badge, CreateGratitudeDto, HeroesRadarQueryDto } from './dto';

@Injectable()
export class GratitudesService {
  private logger = new Logger(GratitudesService.name);

  constructor(
    private discordService: DiscordService,
    @InjectRepository(Feedback)
    private repository: Repository<Feedback>,
    private dataSource: DataSource,
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
      data.userIds.map(userId =>
        this.postUserFeedback({
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

  public async getHeroesRadar({ courseId, current: page = 1, pageSize = 20 }: HeroesRadarQueryDto) {
    console.log('page: ', page);

    const countQuery = this.repository.createQueryBuilder('feedback').select('COUNT(DISTINCT "toUserId") as count');

    const heroesQuery = this.dataSource
      .createQueryBuilder()
      .select([
        '"badges"."githubId"',
        '"badges"."firstName"',
        '"badges"."lastName"',
        'sum("badgeCount") as total',
        `jsonb_agg(json_build_object('badgeId', "badgeId", 'badgeCount', "badgeCount")) as badges`,
      ])
      .from(qb => {
        const subQuery = qb
          .select([
            '"feedback"."badgeId"',
            '"toUser"."githubId"',
            '"toUser"."firstName"',
            '"toUser"."lastName"',
            'COUNT(*) as "badgeCount"',
          ])
          .from(Feedback, 'feedback')
          .leftJoin('feedback.toUser', 'toUser')
          .groupBy('"badgeId"')
          .addGroupBy('"githubId"')
          .addGroupBy('"firstName"')
          .addGroupBy('"lastName"');

        if (courseId) {
          [subQuery, countQuery].forEach(query => query.where('feedback."courseId" = :courseId', { courseId }));
        }

        return subQuery;
      }, 'badges')
      .groupBy('"githubId"')
      .addGroupBy('"firstName"')
      .addGroupBy('"lastName"')
      .orderBy('total', 'DESC')
      .take(pageSize)
      .skip((page - 1) * pageSize);

    const { count } = await countQuery.getRawOne();
    const total = +count;
    const items = await heroesQuery.getRawMany();
    const totalPages = Math.ceil(total / pageSize);

    return {
      items,
      meta: { itemCount: items.length, total, current: page, pageSize, totalPages },
    };
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

    const result = await this.repository.findOneOrFail({
      where: { id },
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
  { id: Badge.JuryTeam, name: 'Jury team', roles: [CourseRole.Manager, CourseRole.Supervisor] },
];
