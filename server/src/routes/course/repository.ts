import { App } from '@octokit/app';
import { Octokit } from '@octokit/rest';
import { OK } from 'http-status-codes';
import Router from '@koa/router';
import { camelCase, toUpper } from 'lodash';
import { getRepository } from 'typeorm';
import { config } from '../../config';
import { ILogger } from '../../logger';
import { Course, Mentor, Student } from '../../models';
import { courseService } from '../../services';
import { setResponse } from '../utils';

const teamsCache: Record<string, number | undefined> = {};
const { appId, privateKey } = config.github;
const app = new App({ id: Number(appId), privateKey });

export const postRepositories = (logger: ILogger) => async (ctx: Router.RouterContext) => {
  const { courseId } = ctx.params as { courseId: number };
  const result: { repository: string }[] = [];
  const course = (await getRepository(Course).findOne(courseId))!;
  const githubIds = await queryStudentGithubIds(courseId);
  for await (const githubId of githubIds) {
    const record = await createRepository(course, githubId, logger);
    if (record?.repository) {
      result.push({ repository: record.repository });
    }
  }
  setResponse(ctx, OK, result);
};

export const postRepository = (logger: ILogger) => async (ctx: Router.RouterContext) => {
  const { courseId, githubId } = ctx.params as { courseId: number; githubId: string };

  const course = (await getRepository(Course).findOne(courseId))!;
  const student = await createRepository(course, githubId, logger);
  setResponse(ctx, OK, { repository: student?.repository });
};

async function createRepository(course: Course, githubId: string, logger: ILogger) {
  const teamName = getTeamName(course);
  let teamId = teamsCache[teamName];
  const { org, installationId } = config.github;
  const installationAccessToken = await app.getInstallationAccessToken({
    installationId: Number(installationId),
  });
  const github = new Octokit({ auth: `token ${installationAccessToken}` });
  if (!teamId) {
    teamId = await createTeam(github, teamName, course.id, logger);
  }
  const repoName = getRepoName(githubId, course);
  logger.info(`creating ${repoName}`);
  const response = await github.repos.createInOrg({
    org,
    name: repoName,
    private: true,
    auto_init: true,
    gitignore_template: 'Node',
    description: `Private repository for @${githubId}`,
  });
  logger.info(`adding team ${teamId} and user ${githubId}`);
  await Promise.all([
    github.teams.addOrUpdateRepo({ team_id: teamId, permission: 'push', owner: org, repo: repoName }),
    github.repos.addCollaborator({ permission: 'push', username: githubId, owner: org, repo: repoName }),
  ]);
  const student = await courseService.getStudentByGithubId(course.id, githubId);
  if (student == null) {
    return null;
  }
  student.repository = response.data.html_url;
  logger.info({ repository: student.repository });
  await getRepository(Student).save(student);
  return student;
}

function getTeamName(course: Course) {
  return `mentors-${course.alias}`;
}

function getRepoName(githubId: string, course: Course) {
  return `${githubId}-${toUpper(camelCase(course.alias))}`;
}

async function createTeam(github: Octokit, teamName: string, courseId: number, logger: ILogger) {
  const { org } = config.github;
  const { data: teams } = await github.teams.list({ org });
  let courseTeam = teams.find(d => d.name === teamName);
  if (!courseTeam) {
    const response = await github.teams.create({ privacy: 'secret', name: teamName, org });
    const maintainers = await queryMentorsGithubIds(courseId);
    courseTeam = response.data;
    teamsCache[teamName] = courseTeam.id;
    for await (const maintainer of maintainers) {
      logger.info(`Inviting ${maintainer}`);
      await github.teams.addOrUpdateMembership({ username: maintainer, team_id: courseTeam.id });
      await timeout(1000);
    }
  }
  return courseTeam.id;
}

async function timeout(num: number) {
  return new Promise(resolve => setTimeout(resolve, num));
}

async function queryMentorsGithubIds(courseId: number) {
  const mentors = await getRepository(Mentor)
    .createQueryBuilder('mentor')
    .innerJoin('mentor.user', 'mentorUser')
    .addSelect(['mentor.id', 'mentorUser.githubId'])
    .where('mentor.courseId = :courseId', { courseId })
    .andWhere('mentor.isExpelled = false')
    .getMany();
  return mentors.map(m => m.user.githubId);
}

async function queryStudentGithubIds(courseId: number) {
  const mentors = await getRepository(Student)
    .createQueryBuilder('student')
    .innerJoin('student.user', 'studentUser')
    .innerJoin('student.stageInterviews', 'stageInterview')
    .addSelect(['student.id', 'studentUser.githubId'])
    .where('student.courseId = :courseId', { courseId })
    .andWhere('student.isExpelled = false AND student.isFailed = false')
    .andWhere('student.mentorId IS NOT NULL')
    .andWhere('student.repository IS NULL')
    .andWhere('stageInterview.isCompleted = true')
    .getMany();
  return mentors.map(m => m.user.githubId);
}
