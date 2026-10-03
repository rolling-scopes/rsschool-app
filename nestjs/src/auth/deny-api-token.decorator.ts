import { SetMetadata } from '@nestjs/common';

export const DENY_API_TOKEN_KEY = 'denyApiToken';

export const DenyApiToken = () => SetMetadata(DENY_API_TOKEN_KEY, true);
