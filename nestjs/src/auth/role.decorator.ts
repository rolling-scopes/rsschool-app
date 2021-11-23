import { SetMetadata } from '@nestjs/common';
import { Role } from './models/role';

export const ROLE_KEY = 'role';

export const RequiredRole = (role: Role) => SetMetadata(ROLE_KEY, role);
