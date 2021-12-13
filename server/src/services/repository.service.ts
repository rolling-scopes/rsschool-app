import { Octokit } from 'octokit';
import { RequestError } from '@octokit/types';
import { getCustomRepository, getRepository } from 'typeorm';
import { config } from '../config';
import { ILogger } from '../logger';
import { Course, CourseUser, Student } from '../models';
import { courseService } from '../services';
import { StudentRepository } from '../repositories/student.repository';
import { MentorRepository } from '../repositories/mentor.repository';
import { MentorBasic } from '../../../common/models';
import { camelCase, toUpper } from 'lodash';

export class RepositoryService {
  constructor(private courseId: number, private github: Octokit, private logger?: ILogger) {}

  public async createMany() {
    const result = [];
    const course = await getRepository(Course).findOne(this.courseId);

    if (course == null || !course.usePrivateRepositories) {
      return;
    }

    await this.createTeam(this.github, this.getTeamName(course), course.id);

    const studentRepo = getCustomRepository(StudentRepository);
    const students = await studentRepo.findActiveByCourseId(this.courseId);

    for (const student of students) {
      const studentWithMentor = await studentRepo.findAndIncludeMentor(this.courseId, student.githubId);

      const record = await this.createRepositoryInternally(this.github, course, student.githubId);
      if (studentWithMentor?.mentor) {
        const { githubId: mentorGithubId } = studentWithMentor.mentor as MentorBasic;
        if (mentorGithubId) {
          await this.inviteMentor(mentorGithubId, course);
        }
      }
      await this.addTeamToRepository(this.github, course, student.githubId);
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
    const mentorGithubId = (studentWithMentor?.mentor as MentorBasic | undefined)?.githubId;
    const result = await this.createRepositoryInternally(this.github, course, githubId);
    if (mentorGithubId) {
      await this.inviteMentor(mentorGithubId, course);
    }
    await this.addTeamToRepository(this.github, course, githubId);
    return result;
  }

  public async updateRepositories() {
    const course = await getRepository(Course).findOne(this.courseId);
    if (!course) {
      return;
    }
    const students = await getCustomRepository(StudentRepository).findAndIncludeRepository(this.courseId);
    for (const githubId of students) {
      const owner = config.github.org;
      const repo = RepositoryService.getRepoName(githubId, course);
      try {
        await this.inviteStudent(owner, repo, githubId);
        await this.addTeamToRepository(this.github, course, githubId);
        await Promise.all([
          this.enablePageSite(this.github, owner, repo),
          this.updateWebhook(this.github, owner, repo),
        ]);
      } catch (e) {
        this.logger?.error(`[${githubId}] Failed update student repository`, e);
      }
    }
  }

  public async updateWebhook(github: Octokit, owner: string, repo: string) {
    try {
      const hooks = await github.rest.repos.listWebhooks({ owner, repo });
      if (hooks.data.length > 0) {
        this.logger?.info(`[${owner}/${repo}] webhook alredy exist`);
        return;
      }
      await this.createWebhook(github, owner, repo);
    } catch (e) {
      this.logger?.error(`[${owner}/${repo}] failed to add webhoo`, e);
    }
  }

  public async createWebhook(github: Octokit, owner: string, repo: string) {
    const ownerRepo = `${owner}/${repo}`;
    this.logger?.info(`[${ownerRepo}] creating webhook`);
    try {
      await github.rest.repos.createWebhook({
        owner,
        repo,
        config: {
          url: `${config.aws.restApiUrl}/github/repository-event`,
          secret: config.github.hooksSecret,
          content_type: 'json',
        },
      });
      this.logger?.info(`[${ownerRepo}] created webhook`);
    } catch (err) {
      const error = err as RequestError;
      if (error.status === 422) {
        // hook exists already
        this.logger?.info(error?.errors ?? error);
        return;
      }
      throw error;
    }
  }

  public async inviteMentor(githubId: string, course?: Course) {
    if (!course) {
      course = await getRepository(Course).findOne(this.courseId);
      if (course == null) {
        return;
      }
    }
    await this.addMentorToTeam(this.github, course, githubId);
  }

  public async inviteAllMentors() {
    const course = await getRepository(Course).findOne(this.courseId);
    if (course == null) {
      return;
    }
    const mentors = await getCustomRepository(MentorRepository).findActive(this.courseId);
    const courseUsers = await getRepository(CourseUser).find({
      where: { courseId: this.courseId },
      relations: ['user'],
    });
    const githubIds = mentors
      .map(m => m.githubId)
      .concat(courseUsers.filter(u => u.isManager || u.isSupervisor).map(cu => cu.user?.githubId))
      .filter(Boolean);
    for (const githubId of githubIds) {
      await this.addMentorToTeam(this.github, course, githubId);
    }
  }

  private async inviteStudent(owner: string, repo: string, githubId: string) {
    try {
      await this.github.rest.repos.addCollaborator({ owner, repo, username: githubId });
    } catch (err) {
      const error = err as RequestError;
      if (error.status === 422) {
        // ignore any action
        this.logger?.info(error.errors ?? error);
        return;
      }
      throw err;
    }
  }

  private async enablePageSite(github: Octokit, owner: string, repo: string) {
    const ownerRepo = `${owner}/${repo}`;
    try {
      this.logger?.info(`[${ownerRepo}] enabling Github Pages`);
      const pages = await github.rest.repos.getPages({ owner, repo }).catch(() => null);
      if (pages?.data.source?.branch === 'gh-pages') {
        this.logger?.info(`[${ownerRepo}] pages already enabled`);
        return;
      }
      const ghPagesRef = await github.rest.git.getRef({ owner, repo, ref: 'heads/gh-pages' }).catch(() => null);
      if (ghPagesRef === null) {
        const mainRef = await github.rest.git
          .getRef({ owner, repo, ref: 'heads/main' })
          // for backward compatibility
          .catch(() => github.rest.git.getRef({ owner, repo, ref: 'heads/master' }));
        await github.rest.git.createRef({ owner, repo, ref: 'refs/heads/gh-pages', sha: mainRef.data.object.sha });
      }
      await github.rest.repos.createPagesSite({ owner, repo, source: { branch: 'gh-pages' } }).catch(response => {
        if (response.status !== 409 && response.status !== 500) {
          throw response;
        }
      });
      this.logger?.info(`[${ownerRepo}] enabled Github Pages`);
    } catch {
      this.logger?.info(`[${ownerRepo}] failed to enable Github Pages`);
    }
  }

  public static getRepoName(githubId: string, course: { alias: string }) {
    return `${githubId}-${toUpper(camelCase(course.alias))}`;
  }

  private async addMentorToTeam(github: Octokit, course: Course, githubId: string) {
    const owner = config.github.org;
    const teamName = this.getTeamName(course);
    const { data: teams } = await github.rest.teams.list({ org: owner });
    const team = teams.find(team => team.name === teamName);
    if (!team) {
      await this.createTeam(github, teamName, course.id);
    }

    this.logger?.info(`[${teamName}] adding user ${githubId}`);
    try {
      await github.rest.teams.addOrUpdateMembershipForUserInOrg({
        org: owner,
        team_slug: teamName,
        username: githubId,
      });
    } catch (err) {
      const error = err as RequestError;
      if (error.status === 404) {
        this.logger?.info(`[${teamName}] user ${githubId} does not exist`);
      } else {
        throw err;
      }
    }
  }

  private async addTeamToRepository(github: Octokit, course: Course, githubId: string) {
    const { org } = config.github;
    const owner = config.github.org;
    const repo = RepositoryService.getRepoName(githubId, course);
    const ownerRepo = `${owner}/${repo}`;
    const teamName = this.getTeamName(course);
    this.logger?.info(`[${ownerRepo}] adding team ${teamName}`);
    try {
      await github.rest.teams.addOrUpdateRepoPermissionsInOrg({
        permission: 'push',
        owner,
        repo,
        team_slug: teamName,
        org,
      });
    } catch (err) {
      const error = err as RequestError;
      this.logger?.info(error.errors ?? error);
      if (error.status === 404) {
        await this.createTeam(github, teamName, course.id);
        await github.rest.teams.addOrUpdateRepoPermissionsInOrg({
          permission: 'push',
          owner,
          repo,
          team_slug: teamName,
          org,
        });
      } else {
        throw err;
      }
    }
  }

  private async createRepositoryInternally(github: Octokit, course: Course, githubId: string) {
    const owner = config.github.org;
    const repo = RepositoryService.getRepoName(githubId, course);
    const ownerRepo = `${owner}/${repo}`;
    this.logger?.info(`[${ownerRepo}] creating`);
    let repository = null;
    try {
      const response = await github.rest.repos.createInOrg({
        org: owner,
        name: repo,
        private: true,
        auto_init: true,
        gitignore_template: 'Node',
        description: `Private repository for @${githubId}`,
      });
      repository = response.data.html_url;
    } catch (err) {
      const error = err as RequestError;
      if (error.status === 422) {
        // if repository exists
        repository = `https://github.com/${owner}/${repo}`;
        this.logger?.info(error.errors ?? error);
      } else {
        throw err;
      }
    }

    await this.inviteStudent(owner, repo, githubId);

    await this.createWebhook(github, owner, repo);

    await this.enablePageSite(github, owner, repo);

    const student = await courseService.getStudentByGithubId(course.id, githubId);
    if (student == null) {
      return null;
    }
    student.repository = repository ?? student.repository;
    this.logger?.info({ repository: student.repository });
    await getRepository(Student).save(student);
    return student;
  }

  getTeamName(course: Course) {
    return `mentors-${course.alias}`;
  }

  async createTeam(github: Octokit, teamName: string, courseId: number) {
    const { org } = config.github;
    const { data: team } = await github.rest.teams.getByName({ org, team_slug: teamName });

    if (!team.slug) {
      const mentors = await getCustomRepository(MentorRepository).findActive(courseId);
      this.logger?.info('Creating team', teamName);
      const response = await github.rest.teams.create({ privacy: 'secret', name: teamName, org });
      const courseTeamSlug = response.data?.slug;
      for (const maintainer of mentors) {
        this.logger?.info(`Inviting ${maintainer.githubId}`);
        await github.rest.teams.addOrUpdateMembershipForUserInOrg({
          org,
          team_slug: courseTeamSlug,
          username: maintainer.githubId,
        });
        await this.timeout(1000);
      }
    }
  }

  private timeout = (num: number) => new Promise(resolve => setTimeout(resolve, num));
}
