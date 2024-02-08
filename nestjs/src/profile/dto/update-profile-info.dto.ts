import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Education, Discord } from './profile-info.dto';
import { EnglishLevel } from '@common/models';

export class UpdateProfileInfoDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  githubId?: string;

  @ApiProperty({ required: false, nullable: true, type: String })
  @IsOptional()
  @IsString()
  aboutMyself?: string | null;

  @IsString()
  @ApiProperty({ required: false, nullable: true, type: String })
  @IsOptional()
  cityName?: string | null;

  @IsString()
  @ApiProperty({ required: false, nullable: true, type: String })
  @IsOptional()
  countryName?: string | null;

  @ApiProperty({ required: false, nullable: true, type: [Education] })
  @IsOptional()
  @IsArray()
  educationHistory?: Education[];

  @ApiProperty({ required: false, nullable: true, type: String })
  @IsOptional()
  @IsString()
  englishLevel?: EnglishLevel | null;

  @ApiProperty({ required: false, type: [String] })
  @IsOptional()
  @IsArray()
  languages?: string[];

  @ApiProperty({ required: false, nullable: true, type: String })
  @IsOptional()
  @IsString()
  contactsPhone?: string | null;

  @ApiProperty({ required: false, nullable: true, type: String })
  @IsOptional()
  @IsString()
  contactsEmail?: string | null;

  @ApiProperty({ required: false, nullable: true, type: String })
  @IsOptional()
  @IsString()
  contactsEpamEmail?: string | null;

  @ApiProperty({ required: false, nullable: true, type: String })
  @IsOptional()
  @IsString()
  contactsSkype?: string | null;

  @ApiProperty({ required: false, nullable: true, type: String })
  @IsOptional()
  @IsString()
  contactsWhatsApp?: string | null;

  @ApiProperty({ required: false, nullable: true, type: String })
  @IsOptional()
  @IsString()
  contactsTelegram?: string | null;

  @ApiProperty({ required: false, nullable: true, type: String })
  @IsOptional()
  @IsString()
  contactsNotes?: string | null;

  @ApiProperty({ required: false, nullable: true, type: String })
  @IsOptional()
  @IsString()
  contactsLinkedIn?: string | null;

  @ApiProperty({ required: false, nullable: true, type: Discord })
  @ValidateNested()
  @IsOptional()
  @Type(() => Discord)
  discord?: Discord | null;
}
