import type { RequestError } from '@/common/types';

export class APIError extends Error {
  constructor(message: string, public statusCode: number, public requestError: RequestError) {
    super();
    this.message = message;
  }
}

export default APIError;
