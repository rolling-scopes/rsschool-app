import { Course } from '@entities/course';
import { ApiProperty } from '@nestjs/swagger';

export class CourseDto {
  constructor(course: Course) {
    this.id = course.id;
    this.alias = course.alias;
    this.name = course.name;
    this.fullName = course.fullName;
    this.descriptionUrl = course.descriptionUrl;
    this.description = course.description;
    this.startDate = course.startDate?.toISOString() ?? null;
    this.endDate = course.endDate?.toISOString() ?? null;
    this.completed = course.completed;
    this.planned = course.planned;
    this.certificateIssuer = course.certificateIssuer;
    this.createdDate = course.createdDate;
    this.updatedDate = course.updatedDate;
    this.locationName = course.locationName;
    this.discordServerId = course.discordServerId;
    this.inviteOnly = course.inviteOnly;
    this.usePrivateRepositories = course.usePrivateRepositories;
    this.registrationEndDate = course.registrationEndDate?.toISOString() ?? null;
    this.personalMentoring = course.personalMentoring;
    this.courseActiveLogoUrl = course.courseActiveLogoUrl;
    this.courseArchivedLogoUrl = course.courseArchivedLogoUrl;
  }

  @ApiProperty()
  id: number;

  @ApiProperty()
  createdDate: string;

  @ApiProperty()
  updatedDate: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  fullName: string;

  @ApiProperty()
  alias: string;

  @ApiProperty()
  description: string;

  @ApiProperty()
  descriptionUrl: string;

  @ApiProperty()
  year: number;

  @ApiProperty()
  startDate: string;

  @ApiProperty()
  endDate: string;

  @ApiProperty()
  registrationEndDate: string;

  @ApiProperty()
  primarySkillId: string;

  @ApiProperty()
  primarySkillName: string;

  @ApiProperty()
  locationName: string;

  @ApiProperty()
  discordServerId: number;

  @ApiProperty()
  completed: boolean;

  @ApiProperty()
  planned: boolean;

  @ApiProperty()
  inviteOnly: boolean;

  @ApiProperty()
  certificateIssuer: string;

  @ApiProperty()
  usePrivateRepositories: boolean;

  @ApiProperty()
  personalMentoring: boolean;

  @ApiProperty()
  courseActiveLogoUrl: string;

  @ApiProperty()
  courseArchivedLogoUrl: string;
}
