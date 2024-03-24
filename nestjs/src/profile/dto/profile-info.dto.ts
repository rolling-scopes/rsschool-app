import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString, IsUrl, ValidateNested } from 'class-validator';
import { ProfileWithCvDto } from './profile.dto';
import { ConfigurableProfilePermissions } from './permissions.dto';
import {
  Contacts,
  EnglishLevel,
  GeneralInfo,
  LegacyFeedback,
  MentorStats,
  PublicFeedback,
  StageInterviewDetailedFeedback,
  Student,
  StudentStats,
  StudentTasksDetail,
} from '@common/models';

class GithubIdName {
  @ApiProperty({ required: true, type: String })
  @IsString()
  name: string;

  @ApiProperty({ required: true, type: String })
  @IsString()
  githubId: string;
}

class LocationInfoDto {
  @ApiProperty({ required: true, type: String })
  @IsString()
  cityName: string;

  @ApiProperty({ required: true, type: String })
  @IsString()
  countryName: string;
}

export class Education {
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

export class Discord {
  @ApiProperty()
  @IsNotEmpty()
  id: string;

  @ApiProperty()
  @IsNotEmpty()
  username: string;

  @ApiProperty()
  @IsNotEmpty()
  discriminator: string;
}

class ProgrammingTaskDto {
  @ApiProperty({ required: true, type: String })
  task: string;

  @ApiProperty({ required: true, type: Number })
  codeWritingLevel: number;

  @ApiProperty({ required: true, type: Number })
  resolved: number;

  @ApiProperty({ required: true, type: String })
  comment: string;
}

class SkillsDto {
  @ApiProperty({ required: true, type: Number })
  htmlCss: number;

  @ApiProperty({ required: true, type: Number })
  common: number;

  @ApiProperty({ required: true, type: Number })
  dataStructures: number;
}

class StepsDto {
  @ApiProperty({ required: true })
  steps: Record<
    string,
    {
      isCompleted: boolean;
      values?: Record<string, string[] | string | number>;
    }
  >;
}

class PartialFeedbackInfoDto {
  @ApiProperty({ required: false, type: StepsDto })
  @IsOptional()
  steps?: StepsDto;
}

class LegacyFeedbackInfoDto implements LegacyFeedback {
  @ApiProperty({ required: false, type: String })
  @IsOptional()
  english?: EnglishLevel;

  @ApiProperty({ required: true, type: String })
  comment: string;

  @ApiProperty({ required: true, type: ProgrammingTaskDto })
  programmingTask: ProgrammingTaskDto;

  @ApiProperty({ required: true, type: SkillsDto })
  skills: SkillsDto;
}

export class GeneralInfoBase extends GithubIdName {
  @ApiProperty({ required: false, nullable: true, type: String })
  @IsOptional()
  aboutMyself?: string | null;

  @ApiProperty({ required: false, nullable: true, type: [Education] })
  @IsOptional()
  @Type(() => Education)
  @IsArray()
  educationHistory?: Education[] | null;

  // TODO: englishLevel should be of type enum, not String type.
  // Currently generator produces enums with the same keys (A1 for both a1/a1+, etc) which is compile blocker for TS.
  // Keywords: typescript-axios openapi enumPropertyNamingReplaceSpecialChar.
  @ApiProperty({ required: false, nullable: true, type: String })
  @IsOptional()
  @IsString()
  englishLevel?: EnglishLevel | null;
}

class GeneralInfoDto extends GeneralInfoBase implements GeneralInfo {
  @ApiProperty({ required: true, type: LocationInfoDto })
  location: LocationInfoDto;

  @ApiProperty({ required: true, type: [String] })
  @IsOptional()
  @IsArray()
  languages: string[];
}

class ContactsInfoDto implements Contacts {
  @ApiProperty({ required: true, nullable: true, type: String })
  @IsString()
  phone: string | null;

  @ApiProperty({ required: true, nullable: true, type: String })
  @IsString()
  email: string | null;

  @ApiProperty({ required: true, nullable: true, type: String })
  @IsString()
  epamEmail: string | null;

  @ApiProperty({ required: true, nullable: true, type: String })
  @IsString()
  skype: string | null;

  @ApiProperty({ required: true, nullable: true, type: String })
  @IsString()
  whatsApp: string | null;

  @ApiProperty({ required: true, nullable: true, type: String })
  @IsString()
  telegram: string | null;

  @ApiProperty({ required: true, nullable: true, type: String })
  @IsString()
  notes: string | null;

  @ApiProperty({ required: true, nullable: true, type: String })
  @IsString()
  linkedIn: string | null;
}

class StudentInfoDto extends GithubIdName implements Student {
  @ApiProperty({ required: true, type: Boolean })
  @IsBoolean()
  isExpelled: boolean;

  @ApiProperty({ required: true, type: Number })
  @IsNumber()
  totalScore: number;

  @ApiProperty({ required: false, type: String })
  @IsOptional()
  @IsUrl()
  repoUrl?: string;
}

class MentorStatsDto implements MentorStats {
  @ApiProperty({ required: true, type: String })
  @IsString()
  courseLocationName: string;

  @ApiProperty({ required: true, type: String })
  @IsString()
  courseName: string;

  @ApiProperty({ required: false, type: [StudentInfoDto] })
  @IsOptional()
  @IsArray()
  students?: StudentInfoDto[];
}

class PublicFeedbackDto implements PublicFeedback {
  @ApiProperty({ required: true, type: String })
  @IsString()
  feedbackDate: string;

  @ApiProperty({ required: true, type: String })
  @IsString()
  badgeId: string;

  @ApiProperty({ required: true, type: String })
  @IsString()
  comment: string;

  @ApiProperty({
    required: true,
    type: GithubIdName,
  })
  fromUser: {
    name: string;
    githubId: string;
  };
}

class InterviewFormAnswerDto {
  @ApiProperty({ required: true, type: String })
  @IsString()
  questionId: string;

  @ApiProperty({ required: true, type: String })
  @IsString()
  questionText: string;

  @ApiProperty({ required: false, type: Boolean })
  @IsOptional()
  @IsBoolean()
  answer?: boolean;
}

export class StageInterviewDetailedFeedbackDto implements StageInterviewDetailedFeedback {
  @ApiProperty({ required: true, type: String })
  @IsString()
  decision: string;

  @ApiProperty({ required: true, type: Boolean })
  @IsBoolean()
  isGoodCandidate: boolean;

  @ApiProperty({ required: true, type: String })
  @IsString()
  courseName: string;

  @ApiProperty({ required: true, type: String })
  @IsString()
  courseFullName: string;

  @ApiProperty({ required: true, type: Number })
  @IsNumber()
  score: number;

  @ApiProperty({ required: true, type: Number })
  @IsNumber()
  maxScore: number;

  @ApiProperty({ required: true, type: String })
  @IsString()
  date: string;

  @ApiProperty({ required: true, type: Number })
  @IsNumber()
  version: number;

  @ApiProperty({ required: true, type: GithubIdName })
  interviewer: GithubIdName;

  @ApiProperty({ required: true, type: Object })
  feedback: LegacyFeedbackInfoDto | PartialFeedbackInfoDto;
}

export class StudentTaskDetailDto implements StudentTasksDetail {
  @ApiProperty({ required: true, type: Number })
  @IsNumber()
  maxScore: number;

  @ApiProperty({ required: true, type: Number })
  @IsNumber()
  scoreWeight: number;

  @ApiProperty({ required: true, type: String })
  @IsString()
  name: string;

  @ApiProperty({ required: true, type: String })
  @IsString()
  descriptionUri: string;

  @ApiProperty({ required: true, type: String })
  @IsString()
  taskGithubPrUris: string;

  @ApiProperty({ required: true, type: Number })
  @IsNumber()
  score: number;

  @ApiProperty({ required: true, type: String })
  @IsString()
  comment: string;

  @ApiProperty({ required: false, type: String })
  @IsOptional()
  @IsString()
  interviewDate?: string;

  @ApiProperty({ required: false, type: GithubIdName })
  @IsOptional()
  @ValidateNested()
  interviewer?: GithubIdName;

  @ApiProperty({ required: false, type: [InterviewFormAnswerDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  interviewFormAnswers?: InterviewFormAnswerDto[];
}

class StudentStatsDto implements StudentStats {
  @ApiProperty({ required: true, type: Number })
  @IsNumber()
  courseId: number;

  @ApiProperty({ required: true, type: String })
  @IsString()
  courseName: string;

  @ApiProperty({ required: true, type: String })
  @IsString()
  locationName: string;

  @ApiProperty({ required: true, type: String })
  @IsString()
  courseFullName: string;

  @ApiProperty({ required: true, type: Boolean })
  @IsBoolean()
  isExpelled: boolean;

  @ApiProperty({ required: true, type: Boolean })
  @IsBoolean()
  isSelfExpelled: boolean;

  @ApiProperty({ required: false, type: String })
  @IsOptional()
  @IsString()
  expellingReason?: string;

  @ApiProperty({ required: true, type: String })
  @IsString()
  certificateId: string | null;

  @ApiProperty({ required: true, type: Boolean })
  @IsBoolean()
  isCourseCompleted: boolean;

  @ApiProperty({ required: true, type: Number })
  @IsNumber()
  totalScore: number;

  @ApiProperty({ required: true, type: Number })
  @IsNumber()
  rank: number | null;

  @ApiProperty({ required: true, type: GithubIdName })
  @ValidateNested()
  mentor: GithubIdName;

  @ApiProperty({ required: true, type: [StudentTaskDetailDto] })
  @IsArray()
  @ValidateNested({ each: true })
  tasks: StudentTaskDetailDto[];
}

export class ProfileInfoBase {
  @ApiProperty({ type: ConfigurableProfilePermissions })
  @ValidateNested()
  @Type(() => ConfigurableProfilePermissions)
  permissionsSettings: ConfigurableProfilePermissions;

  @ApiProperty({ type: ContactsInfoDto })
  @ValidateNested()
  @Type(() => ContactsInfoDto)
  contacts: ContactsInfoDto;

  @ApiProperty({ required: true, nullable: true, type: Discord })
  @Type(() => Discord)
  discord: Discord | null;
}

export class ProfileInfoDto extends ProfileInfoBase {
  @ApiProperty({ type: GeneralInfoDto })
  @ValidateNested()
  @Type(() => GeneralInfoDto)
  generalInfo: GeneralInfoDto;
}

export class ProfileInfoExtendedDto extends ProfileInfoDto implements ProfileWithCvDto {
  @ApiProperty({ required: false, type: [MentorStatsDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested()
  mentorStats: MentorStatsDto[];

  @ApiProperty({ required: false, type: [StudentStatsDto] })
  @IsOptional()
  @ValidateNested()
  studentStats: StudentStatsDto[];

  @ApiProperty({ required: false, type: [PublicFeedbackDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested()
  publicFeedback: PublicFeedbackDto[];

  @ApiProperty({ required: false, type: [StageInterviewDetailedFeedbackDto] })
  @IsOptional()
  @ValidateNested()
  stageInterviewFeedback: StageInterviewDetailedFeedbackDto[];

  @ApiProperty({ required: false, nullable: true, type: String })
  @IsOptional()
  publicCvUrl: string | null;
}
