import { PartialType } from '@nestjs/mapped-types';
import { CreateTestUserDto } from './create-testUser.dto';

export class UpdateTestUserDto extends PartialType(CreateTestUserDto) {}
