import fetch from 'node-fetch';
import { ILogger } from '../logger';
import { config } from '../config';

interface AssignBadgeParams {
  assignerName: string;
  assignerEmail: string;
  receiverName: string;
  receiverEmail: string;
  event: string;
  comment: string;
}

(process.env as any).NODE_TLS_REJECT_UNAUTHORIZED = 0;

export class HeroesService {
  logger: ILogger;

  constructor(logger: ILogger) {
    this.logger = logger.child({ module: 'heroes.by' });
  }

  public isCommentValid(comment: string | undefined) {
    return comment && comment.length >= 20;
  }

  public async assignBadge(params: AssignBadgeParams) {
    if (!this.isDisabled()) {
      return;
    }
    const { url, username, password } = config.integrations.heroes;
    const result = await fetch(url!, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Basic ${Buffer.from(username + ':' + password).toString('base64')}`,
      },
      body: JSON.stringify(params),
    });
    const response = await result.json();
    this.logger.info(response);
  }

  private isDisabled() {
    return !config.integrations.heroes.url;
  }
}
