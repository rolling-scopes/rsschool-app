import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, Matches, MaxLength, MinLength } from 'class-validator';

const SYSTEM_GITHUB_ID_PATTERN = /^system:[a-z0-9-]{1,80}$/;

export class CreateSystemUserDto {
  @ApiProperty({ description: 'Display name shown in admin lists and audit log', maxLength: 80 })
  @IsString()
  @MinLength(1)
  @MaxLength(80)
  public name: string;

  @ApiProperty({
    required: false,
    description: 'Reserved login of the form "system:<slug>". Generated if omitted.',
  })
  @IsOptional()
  @IsString()
  @Matches(SYSTEM_GITHUB_ID_PATTERN, {
    message: 'githubId must match pattern "system:<slug>" with lowercase letters, digits and dashes',
  })
  public githubId?: string;
}
