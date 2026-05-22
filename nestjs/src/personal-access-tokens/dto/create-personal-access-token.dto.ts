import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, Max, MaxLength, Min, MinLength } from 'class-validator';
import { PAT_MAX_EXPIRY_DAYS } from '../personal-access-tokens.service';

export class CreatePersonalAccessTokenDto {
  @ApiProperty({ description: 'Human-readable label shown to the user', maxLength: 100 })
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  public name: string;

  @ApiProperty({
    required: false,
    description: 'Number of days until the token expires. Defaults to 90, capped at 365.',
    minimum: 1,
    maximum: PAT_MAX_EXPIRY_DAYS,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(PAT_MAX_EXPIRY_DAYS)
  public expiresInDays?: number;
}
