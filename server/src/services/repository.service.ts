import { App } from '@octokit/app';
import { Octokit } from '@octokit/rest';
import { camelCase, toUpper } from 'lodash';
import { getRepository, getCustomRepository } from 'typeorm';
import { config } from '../config';
import { ILogger } from '../logger';
import { Course, Student } from '../models';
import { courseService } from '../services';
import { StudentRepository } from '../repositories/student';
import { MentorRepository } from '../repositories/mentor';

const teamsCache: Record<string, number | undefined> = {};
const { appId, privateKey } = config.github;
const app = new App({ id: Number(appId), privateKey });

export class RepositoryService {
  constructor(private courseId: number, private logger?: ILogger) {}

  public async createMany(options: { includeNoMentor: boolean; includeNoTechnicalScreening: boolean }) {
    const result = [];
    const course = await getRepository(Course).findOne(this.courseId);
    if (course == null) {
      return;
    }

    const studentRepo = getCustomRepository(StudentRepository);
    const githubIds = await studentRepo.findEliggibleForRepository(this.courseId, options);
    for (const githubId of githubIds) {
      const record = await this.createRepositoryInternally(course, githubId);
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
    return this.createRepositoryInternally(course, githubId);
  }

  public async enableGhPages() {
    const course = await getRepository(Course).findOne(this.courseId);
    const students = await getCustomRepository(StudentRepository).findWithRepository(this.courseId);
    const github = await this.initGithub();
    for (const githubId of students) {
      await github.repos.enablePagesSite({
        repo: this.getRepoName(githubId, course!),
        owner: config.github.org,
        source: { branch: 'gh-pages', path: '/' },
      });
    }
  }

  private async initGithub() {
    const { installationId } = config.github;
    const installationAccessToken = await app.getInstallationAccessToken({
      installationId: Number(installationId),
    });
    const github = new Octokit({ auth: `token ${installationAccessToken}` });
    return github;
  }

  public getRepoName(githubId: string, course: { alias: string }) {
    return `${githubId}-${toUpper(camelCase(course.alias))}`;
  }

  private async createRepositoryInternally(course: Course, githubId: string) {
    const teamName = this.getTeamName(course);
    let teamId = teamsCache[teamName];
    const { org } = config.github;
    const github = await this.initGithub();
    if (!teamId) {
      teamId = await this.createTeam(github, teamName, course.id);
    }
    const repoName = this.getRepoName(githubId, course);
    this.logger?.info(`creating ${repoName}`);
    const response = await github.repos.createInOrg({
      org,
      name: repoName,
      private: true,
      auto_init: true,
      gitignore_template: 'Node',
      description: `Private repository for @${githubId}`,
    });
    this.logger?.info(`adding team ${teamId} and user ${githubId}`);
    await Promise.all([
      github.teams.addOrUpdateRepo({ team_id: teamId, permission: 'push', owner: org, repo: repoName }),
      github.repos.addCollaborator({ permission: 'push', username: githubId, owner: org, repo: repoName }),
    ]);
    await github.repos.enablePagesSite({
      owner: org,
      repo: repoName,
      source: { branch: 'gh-pages', path: '/' },
    });
    const student = await courseService.getStudentByGithubId(course.id, githubId);
    if (student == null) {
      return null;
    }
    student.repository = response.data.html_url;
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
        await github.teams.addOrUpdateMembership({ username: maintainer.githubId, team_id: courseTeam.id });
        await this.timeout(1000);
      }
    }
    return courseTeam.id;
  }

  private timeout = (num: number) => new Promise(resolve => setTimeout(resolve, num));
}
