import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsBoolean, IsOptional } from 'class-validator';

export interface Permissions {
  isProfileVisible: boolean;
  isAboutVisible: boolean;
  isEducationVisible: boolean;
  isEnglishVisible: boolean;
  isEmailVisible: boolean;
  isTelegramVisible: boolean;
  isSkypeVisible: boolean;
  isWhatsAppVisible: boolean;
  isPhoneVisible: boolean;
  isContactsNotesVisible: boolean;
  isLinkedInVisible: boolean;
  isPublicFeedbackVisible: boolean;
  isMentorStatsVisible: boolean;
  isStudentStatsVisible: boolean;
  isStageInterviewFeedbackVisible: boolean;
  isCoreJsFeedbackVisible: boolean;
  isConsentsVisible: boolean;
  isExpellingReasonVisible: boolean;
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

export class ConfigurableProfilePermissions {
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
