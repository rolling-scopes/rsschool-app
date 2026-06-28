import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpsertUserDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  githubId: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  firstName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  lastName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  primaryEmail?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  cityName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  countryName?: string;
}

export class UpdateActivistDto {
  @ApiProperty()
  @IsBoolean()
  activist: boolean;
}

export class OperationResultDto {
  @ApiProperty()
  status: string;

  @ApiProperty({ required: false, type: String })
  value?: string;
}
