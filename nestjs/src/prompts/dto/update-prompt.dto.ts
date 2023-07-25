import { PartialType } from '@nestjs/mapped-types';
import { CreatePromptDto } from './create-prompt.dto';

export class UpdatePromptDto extends PartialType(CreatePromptDto) {}
