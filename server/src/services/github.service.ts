import { config } from '../config';
import { App, Octokit } from 'octokit';

const { appId, privateKey } = config.github;
const app = appId && privateKey ? new App({ appId: Number(appId), privateKey }) : null;

export class GithubService {
  public static async initGithub(): Promise<Octokit> {
    const { installationId } = config.github;
    if (!app) {
      throw new Error('Github App is not configured');
    }
    const octokit = await app.getInstallationOctokit(Number(installationId));
    return octokit;
  }
}
