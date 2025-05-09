import { Course } from '@entities/course';
import { ApiProperty } from '@nestjs/swagger';
import { IdNameDto } from '../../core/dto';

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
    this.createdDate = course.createdDate.toISOString();
    this.updatedDate = course.updatedDate.toISOString();
    this.locationName = course.locationName;
    this.discordServerId = course.discordServerId;
    this.inviteOnly = course.inviteOnly;
    this.usePrivateRepositories = course.usePrivateRepositories;
    this.registrationEndDate = course.registrationEndDate?.toISOString() ?? null;
    this.personalMentoring = course.personalMentoring;
    this.personalMentoringStartDate = course.personalMentoringStartDate?.toISOString() ?? null;
    this.personalMentoringEndDate = course.personalMentoringEndDate?.toISOString() ?? null;
    this.logo = course.logo;
    this.discipline = course.discipline ? { id: course.discipline.id, name: course.discipline.name } : null;
    this.minStudentsPerMentor = course.minStudentsPerMentor;
    this.certificateThreshold = course.certificateThreshold;
    this.wearecommunityUrl = course.wearecommunityUrl;
    this.certificateDisciplines = course.certificateDisciplines.map(id => Number(id));
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

  @ApiProperty({ type: 'string', nullable: true })
  registrationEndDate: string | null;

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

  @ApiProperty({ type: 'string', nullable: true })
  personalMentoringStartDate: string | null;

  @ApiProperty({ type: 'string', nullable: true })
  personalMentoringEndDate: string | null;

  @ApiProperty()
  logo: string;

  @ApiProperty({ nullable: true, type: IdNameDto })
  discipline: IdNameDto | null;

  @ApiProperty()
  minStudentsPerMentor: number;

  @ApiProperty()
  certificateThreshold: number;

  @ApiProperty({ nullable: true, type: String })
  wearecommunityUrl: string | null;

  @ApiProperty({ type: [Number] })
  certificateDisciplines: number[];
}
