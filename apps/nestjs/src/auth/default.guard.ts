import { AuthGuard } from '@nestjs/passport';

export const DefaultGuard = AuthGuard(['jwt', 'basic']);
