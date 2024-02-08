import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString, IsUrl, ValidateNested } from 'class-validator';
import { ProfileWithCvDto } from './profile.dto';
import { ConfigurableProfilePermissions } from './permissions.dto';
import {
  Contacts,
  EnglishLevel,
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

class GeneralInfo extends GithubIdName {
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

class ContactsDto implements Contacts {
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
  whatsApp: string | null;

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

class StudentDto extends GithubIdName implements Student {
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

  @ApiProperty({ required: false, type: [StudentDto] })
  @IsOptional()
  @IsArray()
  students?: StudentDto[];
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

  @ApiProperty({ required: true })
  feedback: StageInterviewDetailedFeedback['feedback'];
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

  @ApiProperty({ required: false, type: InterviewFormAnswerDto })
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

  @ApiProperty({ required: true })
  @IsArray()
  @ValidateNested({ each: true })
  tasks: StudentTaskDetailDto[];
}

export class ProfileInfoBaseDto {
  @ApiProperty({ type: ConfigurableProfilePermissions })
  @ValidateNested()
  @Type(() => ConfigurableProfilePermissions)
  permissionsSettings: ConfigurableProfilePermissions;

  @ApiProperty({ type: GeneralInfo })
  @ValidateNested()
  @Type(() => GeneralInfo)
  generalInfo: GeneralInfo;

  @ApiProperty({ type: ContactsDto })
  @ValidateNested()
  @Type(() => ContactsDto)
  contacts: ContactsDto;

  @ApiProperty({ required: false, nullable: true, type: Discord })
  @Type(() => Discord)
  @IsOptional()
  discord: Discord | null;
}

export class ProfileInfoExtendedDto extends ProfileInfoBaseDto implements ProfileWithCvDto {
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
