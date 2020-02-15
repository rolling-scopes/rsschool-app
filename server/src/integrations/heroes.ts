import axios from 'axios';
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

  public async assignBadge(params: AssignBadgeParams): Promise<string | null> {
    if (this.isDisabled()) {
      return null;
    }
    const { url, username, password } = config.integrations.heroes;
    const result = await axios
      .post<HeroesResponse>(url!, params, { auth: { username, password } })
      .catch(() => ({ data: {} as HeroesResponse }));
    this.logger.info('request', params);
    const response: HeroesResponse = result.data;
    this.logger.info('response', response);
    return response.content;
  }

  private isDisabled() {
    return !config.integrations.heroes.url;
  }
}

interface HeroesResponse {
  content: string;
  errors: {
    code: string | null;
    message: string;
    path: string | null;
  }[];
}
