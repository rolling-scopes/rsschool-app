import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsEnum, IsOptional, IsString } from 'class-validator';
import { AvailableLanguages } from '@entities/data';

export class UpdateUserDto {
  @ApiProperty({ required: false, nullable: true })
  @IsOptional()
  @IsString()
  firstName?: string;

  @ApiProperty({ required: false, nullable: true })
  @IsOptional()
  @IsString()
  lastName?: string;

  @ApiProperty({ required: false, nullable: true })
  @IsOptional()
  @IsString()
  primaryEmail?: string;

  @ApiProperty({ required: false, nullable: true })
  @IsOptional()
  @IsString()
  cityName?: string;

  @ApiProperty({ required: false, nullable: true })
  @IsOptional()
  @IsString()
  countryName?: string;

  @ApiProperty({ required: false, nullable: true })
  @IsOptional()
  @IsString()
  contactsNotes?: string;

  @ApiProperty({ required: false, nullable: true })
  @IsOptional()
  @IsString()
  contactsPhone?: string;

  @ApiProperty({ required: false, nullable: true })
  @IsOptional()
  @IsString()
  contactsEmail?: string;

  @ApiProperty({ required: false, nullable: true })
  @IsOptional()
  @IsString()
  contactsEpamEmail?: string;

  @ApiProperty({ required: false, nullable: true })
  @IsOptional()
  @IsString()
  contactsSkype?: string;

  @ApiProperty({ required: false, nullable: true })
  @IsOptional()
  @IsString()
  contactsWhatsApp?: string;

  @ApiProperty({ required: false, nullable: true })
  @IsOptional()
  @IsString()
  contactsTelegram?: string;

  @ApiProperty({ required: false, nullable: true })
  @IsOptional()
  @IsString()
  contactsLinkedIn?: string;

  @ApiProperty({ required: false, nullable: true })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({ required: false, nullable: true })
  @IsOptional()
  @IsString()
  aboutMyself?: string;

  @ApiProperty({
    enum: AvailableLanguages,
    isArray: true,
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsEnum(AvailableLanguages, { each: true })
  languages?: AvailableLanguages[];
}
