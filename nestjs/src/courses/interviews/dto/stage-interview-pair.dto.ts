import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateStageInterviewsDto {
  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  noRegistration?: boolean;
}

export class UpdateStageInterviewPairDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  githubId: string;
}
