import { App } from '@octokit/app';
import { Octokit } from '@octokit/rest';
import { camelCase, toUpper } from 'lodash';
import { getCustomRepository, getRepository } from 'typeorm';
import { config } from '../config';
import { ILogger } from '../logger';
import { Course, Student } from '../models';
import { courseService } from '../services';
import { StudentRepository } from '../repositories/student';
import { MentorRepository } from '../repositories/mentor';
import { MentorBasic } from '../../../common/models';

const teamsCache: Record<string, any | undefined> = {};
const { appId, privateKey } = config.github;
const app = new App({ id: Number(appId), privateKey });

export class RepositoryService {
  constructor(private courseId: number, private logger?: ILogger) {}

  public async createMany(options: { includeNoMentor: boolean; includeNoTechnicalScreening: boolean }) {
    const result = [];
    const github = await this.initGithub();
    const course = await getRepository(Course).findOne(this.courseId);
    if (course == null) {
      return;
    }

    const studentRepo = getCustomRepository(StudentRepository);
    const githubIds = await studentRepo.findEliggibleForRepository(this.courseId, options);

    for (const githubId of githubIds) {
      const studentWithMentor = await studentRepo.findAndIncludeMentor(this.courseId, githubId);
      const { githubId: mentorGithubId } = studentWithMentor?.mentor as MentorBasic;
      const record = await this.createRepositoryInternally(github, course, githubId);
      if (mentorGithubId) {
        await this.inviteMentor(mentorGithubId, course);
      }
      await this.addCollaboratorsForRepository(github, course, githubId);

      if (record?.repository) {
        result.push({ repository: record.repository });
      }
    }
    return result;
  }

  public async createSingle(githubId: string) {
    const course = await getRepository(Course).findOne(this.courseId);
    if (course == null) {
      return null;
    }
    const studentWithMentor = await getCustomRepository(StudentRepository).findAndIncludeMentor(
      this.courseId,
      githubId,
    );
    const { githubId: mentorGithubId } = studentWithMentor?.mentor as MentorBasic;
    const github = await this.initGithub();
    const result = await this.createRepositoryInternally(github, course, githubId);
    if (mentorGithubId) {
      await this.inviteMentor(mentorGithubId, course);
    }
    await this.addCollaboratorsForRepository(github, course, githubId);
    return result;
  }

  public async updateRepositories() {
    const course = await getRepository(Course).findOne(this.courseId);
    const students = await getCustomRepository(StudentRepository).findWithRepository(this.courseId);
    const github = await this.initGithub();
    for (const githubId of students) {
      const owner = config.github.org;
      const repo = this.getRepoName(githubId, course!);
      await Promise.all([this.enablePageSite(github, owner, repo), this.updateWebhook(github, owner, repo)]);
    }
  }

  public async updateWebhook(github: Octokit, owner: string, repo: string) {
    const hooks = await github.repos.listWebhooks({ owner, repo });
    if (hooks.data.length > 0) {
      this.logger?.info(`[${owner}/${repo}] webhook alredy exist`);
      return;
    }
    await this.createWebhook(github, owner, repo);
  }

  public async createWebhook(github: Octokit, owner: string, repo: string) {
    const ownerRepo = `${owner}/${repo}`;
    this.logger?.info(`[${ownerRepo}] creating webhook`);
    await github.repos.createWebhook({
      owner,
      repo,
      config: {
        url: `${config.aws.restApiUrl}/github/repository-event`,
        secret: config.github.hooksSecret,
        content_type: 'json',
      },
    });
    this.logger?.info(`[${ownerRepo}] created webhook`);
  }

  public async inviteMentor(githubId: string, course?: Course) {
    if (!course) {
      course = await getRepository(Course).findOne(this.courseId);
      if (course == null) {
        return;
      }
    }
    const github = await this.initGithub();
    await this.addMentorToTeam(github, course, githubId);
  }

  public async inviteAllMentors() {
    const mentors = await getCustomRepository(MentorRepository).findActive(this.courseId);
    const course = await getRepository(Course).findOne(this.courseId);
    if (course == null) {
      return;
    }
    const github = await this.initGithub();
    for (const mentor of mentors) {
      await this.addMentorToTeam(github, course, mentor.githubId);
    }
  }

  private async initGithub() {
    const { installationId } = config.github;
    const installationAccessToken = await app.getInstallationAccessToken({
      installationId: Number(installationId),
    });
    return new Octokit({ auth: `token ${installationAccessToken}` });
  }

  private async enablePageSite(github: Octokit, owner: string, repo: string) {
    const ownerRepo = `${owner}/${repo}`;
    this.logger?.info(`[${ownerRepo}] enabling Github Pages`);
    const pages = await github.repos.getPages({ owner, repo }).catch(() => null);
    if (pages?.data.source.branch === 'gh-pages') {
      this.logger?.info(`[${ownerRepo}] pages already enabled`);
      return;
    }
    const ghPagesRef = await github.git.getRef({ owner, repo, ref: 'heads/gh-pages' }).catch(() => null);
    if (ghPagesRef === null) {
      const masterRef = await github.git.getRef({ owner, repo, ref: 'heads/master' });
      await github.git.createRef({ owner, repo, ref: 'refs/heads/gh-pages', sha: masterRef.data.object.sha });
    }
    await github.repos.createPagesSite({ owner, repo, source: { branch: 'gh-pages' } }).catch(response => {
      if (response.status !== 409 && response.status !== 500) {
        throw response;
      }
    });
    this.logger?.info(`[${ownerRepo}] enabled Github Pages`);
  }
  public getRepoName(githubId: string, course: { alias: string }) {
    return `${githubId}-${toUpper(camelCase(course.alias))}`;
  }

  private async addMentorToTeam(github: Octokit, course: Course, githubId: string) {
    const owner = config.github.org;
    const teamName = this.getTeamName(course);
    let teamSlug = teamsCache[teamName];
    if (!teamSlug) {
      teamSlug = await this.createTeam(github, teamName, course.id);
    }

    this.logger?.info(`adding user ${githubId} to the team ${teamSlug}`);
    await github.teams.addOrUpdateMembershipForUserInOrg({ org: owner, team_slug: teamSlug, username: githubId });
  }

  private async addCollaboratorsForRepository(github: Octokit, course: Course, githubId: string) {
    const { org } = config.github;
    const owner = config.github.org;
    const repo = this.getRepoName(githubId, course);
    const ownerRepo = `${owner}/${repo}`;
    const teamName = this.getTeamName(course);
    this.logger?.info(`[${ownerRepo}] adding team ${teamName}`);
    await github.teams.addOrUpdateRepoPermissionsInOrg({ permission: 'push', owner, repo, team_slug: teamName, org });
  }

  private async createRepositoryInternally(github: Octokit, course: Course, githubId: string) {
    const owner = config.github.org;
    const repo = this.getRepoName(githubId, course);
    const ownerRepo = `${owner}/${repo}`;
    this.logger?.info(`[${ownerRepo}] creating`);
    let response;
    try {
      response = await github.repos.createInOrg({
        org: owner,
        name: repo,
        private: true,
        auto_init: true,
        gitignore_template: 'Node',
        description: `Private repository for @${githubId}`,
      });
    } catch (e) {
      if (e.status === 422) {
        this.logger?.info(e.errors[0].message);
      } else {
        throw e;
      }
    }

    // await this.createWebhook(github, owner, repo);
    //
    // await this.enablePageSite(github, owner, repo);

    const student = await courseService.getStudentByGithubId(course.id, githubId);
    if (student == null) {
      return null;
    }
    student.repository = response ? response.data.html_url : student.repository;
    this.logger?.info({ repository: student.repository });
    await getRepository(Student).save(student);
    return student;
  }

  getTeamName(course: Course) {
    return `mentors-${course.alias}`;
  }

  async createTeam(github: Octokit, teamName: string, courseId: number) {
    const { org } = config.github;
    const { data: teams } = await github.teams.list({ org });
    const mentors = await getCustomRepository(MentorRepository).findActive(courseId);
    let courseTeam = teams.find(d => d.name === teamName);
    if (!courseTeam) {
      const response = await github.teams.create({ privacy: 'secret', name: teamName, org });
      courseTeam = response.data;
      teamsCache[teamName] = courseTeam.id;
      for (const maintainer of mentors) {
        this.logger?.info(`Inviting ${maintainer.githubId}`);
        await github.teams.addOrUpdateMembershipForUserInOrg({
          org,
          team_slug: courseTeam.slug,
          username: maintainer.githubId,
        });
        await this.timeout(1000);
      }
    }
    return courseTeam.slug;
  }

  private timeout = (num: number) => new Promise(resolve => setTimeout(resolve, num));
}
