import { config } from '../config';
import { Octokit } from '@octokit/rest';
import { App } from '@octokit/app';

const { appId, privateKey } = config.github;
const app = new App({ appId: Number(appId), privateKey });

export class GithubService {
  public static async initGithub(): Promise<Octokit> {
    const { installationId } = config.github;
    const installationAccessToken = await app.getInstallationOctokit(Number(installationId));
    return new Octokit({ auth: `token ${installationAccessToken}` });
  }
}
