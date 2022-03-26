import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsBoolean, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator';
import { EnglishLevel } from '../../../../common/models';

class Location {
  @IsString()
  @ApiProperty({ required: false, nullable: true, type: String })
  @IsOptional()
  cityName: string | null;

  @IsString()
  @ApiProperty({ required: false, nullable: true, type: String })
  @IsOptional()
  countryName: string | null;
}

class PublicVisibilitySettings {
  @ApiProperty()
  @IsBoolean()
  all: boolean;
}

class PartialStudentVisibilitySettings extends PublicVisibilitySettings {
  @ApiProperty()
  @IsBoolean()
  student: boolean;
}

class ContactsVisibilitySettings extends PublicVisibilitySettings {
  @ApiProperty()
  @IsBoolean()
  student: boolean;
}

class VisibilitySettings extends PublicVisibilitySettings {
  @ApiProperty()
  @IsBoolean()
  mentor: boolean;

  @ApiProperty()
  @IsBoolean()
  student: boolean;
}

class ConfigurableProfilePermissions {
  @ApiProperty({ required: false, type: PublicVisibilitySettings })
  @Type(() => PublicVisibilitySettings)
  @IsOptional()
  isProfileVisible?: PublicVisibilitySettings;

  @ApiProperty({ required: false, type: VisibilitySettings })
  @Type(() => VisibilitySettings)
  @IsOptional()
  isAboutVisible?: VisibilitySettings;

  @ApiProperty({ required: false, type: VisibilitySettings })
  @Type(() => VisibilitySettings)
  @IsOptional()
  isEducationVisible?: VisibilitySettings;

  @ApiProperty({ required: false, type: PartialStudentVisibilitySettings })
  @Type(() => PartialStudentVisibilitySettings)
  @IsOptional()
  isEnglishVisible?: PartialStudentVisibilitySettings;

  @ApiProperty({ required: false, type: ContactsVisibilitySettings })
  @Type(() => ContactsVisibilitySettings)
  @IsOptional()
  isEmailVisible?: ContactsVisibilitySettings;

  @ApiProperty({ required: false, type: ContactsVisibilitySettings })
  @Type(() => ContactsVisibilitySettings)
  @IsOptional()
  isTelegramVisible?: ContactsVisibilitySettings;

  @ApiProperty({ required: false, type: ContactsVisibilitySettings })
  @Type(() => ContactsVisibilitySettings)
  @IsOptional()
  isSkypeVisible?: ContactsVisibilitySettings;

  @ApiProperty({ required: false, type: ContactsVisibilitySettings })
  @Type(() => ContactsVisibilitySettings)
  @IsOptional()
  isPhoneVisible?: ContactsVisibilitySettings;

  @ApiProperty({ required: false, type: ContactsVisibilitySettings })
  @Type(() => ContactsVisibilitySettings)
  @IsOptional()
  isContactsNotesVisible?: ContactsVisibilitySettings;

  @ApiProperty({ required: false, type: VisibilitySettings })
  @Type(() => VisibilitySettings)
  @IsOptional()
  isLinkedInVisible?: VisibilitySettings;

  @ApiProperty({ required: false, type: VisibilitySettings })
  @Type(() => VisibilitySettings)
  @IsOptional()
  isPublicFeedbackVisible?: VisibilitySettings;

  @ApiProperty({ required: false, type: VisibilitySettings })
  @Type(() => VisibilitySettings)
  @IsOptional()
  isMentorStatsVisible?: VisibilitySettings;

  @ApiProperty({ required: false, type: PartialStudentVisibilitySettings })
  @Type(() => PartialStudentVisibilitySettings)
  @IsOptional()
  isStudentStatsVisible?: PartialStudentVisibilitySettings;
}

class Education {
  @ApiProperty()
  @IsString()
  university: string;

  @ApiProperty()
  @IsString()
  faculty: string;

  @ApiProperty()
  @IsNumber()
  graduationYear: number;
}

class GeneralInfo {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsString()
  githubId: string;

  @ApiProperty({ required: false, nullable: true, type: String })
  @IsOptional()
  aboutMyself?: string | null;

  @ApiProperty({ type: Location })
  @Type(() => Location)
  @ValidateNested()
  location: Location;

  @ApiProperty({ required: false, nullable: true, type: [Education] })
  @IsOptional()
  @Type(() => Education)
  @IsArray()
  educationHistory?: Education[] | null;

  @ApiProperty({ required: false, nullable: true, type: String })
  @IsOptional()
  @IsString()
  englishLevel?: EnglishLevel | null;
}

class Contacts {
  @ApiProperty({ required: false, nullable: true, type: String })
  @IsOptional()
  @IsString()
  phone: string | null;

  @ApiProperty({ required: false, nullable: true, type: String })
  @IsOptional()
  @IsString()
  email: string | null;

  @ApiProperty({ required: false, nullable: true, type: String })
  @IsOptional()
  @IsString()
  epamEmail: string | null;

  @ApiProperty({ required: false, nullable: true, type: String })
  @IsOptional()
  @IsString()
  skype: string | null;

  @ApiProperty({ required: false, nullable: true, type: String })
  @IsOptional()
  @IsString()
  telegram: string | null;

  @ApiProperty({ required: false, nullable: true, type: String })
  @IsOptional()
  @IsString()
  notes: string | null;

  @ApiProperty({ required: false, nullable: true, type: String })
  @IsOptional()
  @IsString()
  linkedIn: string | null;
}

class Discord {
  @ApiProperty()
  @IsNumber()
  id: number;

  @ApiProperty()
  @IsString()
  username: string;

  @ApiProperty()
  @IsNumber()
  discriminator: number;
}

export class ProfileInfoDto {
  @ApiProperty({ type: ConfigurableProfilePermissions })
  @ValidateNested()
  @Type(() => ConfigurableProfilePermissions)
  permissionsSettings: ConfigurableProfilePermissions;

  @ApiProperty({ type: GeneralInfo })
  @ValidateNested()
  @Type(() => GeneralInfo)
  generalInfo: GeneralInfo;

  @ApiProperty({ type: Contacts })
  @ValidateNested()
  @Type(() => Contacts)
  contacts: Contacts;

  @ApiProperty({ required: false, nullable: true, type: Discord })
  @Type(() => Discord)
  @IsOptional()
  discord: Discord | null;

  @ApiProperty()
  @IsBoolean()
  isPermissionsSettingsChanged: boolean;

  @ApiProperty()
  @IsBoolean()
  isProfileSettingsChanged: boolean;
}
