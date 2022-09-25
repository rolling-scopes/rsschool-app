import { Resume } from '@entities/resume';
import { LanguageLevel } from '@entities/data';
import { ApiProperty } from '@nestjs/swagger';

type FormData = Omit<Resume, 'uuid' | 'updatedDate' | 'user' | 'userId' | 'isHidden' | 'githubId' | 'expires' | 'id'>;
type Nullable<T> = { [key in keyof T]: T[key] | null };
export class FormDataDto {
  constructor(
    resume: Nullable<FormData> & { fullTime: boolean; militaryService: string; englishLevel: LanguageLevel },
  ) {
    this.avatarLink = resume.avatarLink;
    this.desiredPosition = resume.desiredPosition;
    this.email = resume.email;
    this.englishLevel = resume.englishLevel;
    this.fullTime = resume.fullTime;
    this.githubUsername = resume.githubUsername;
    this.linkedin = resume.linkedin;
    this.locations = resume.locations;
    this.militaryService = resume.militaryService;
    this.name = resume.name;
    this.notes = resume.notes;
    this.phone = resume.phone;
    this.selfIntroLink = resume.selfIntroLink;
    this.skype = resume.skype;
    this.startFrom = resume.startFrom;
    this.telegram = resume.telegram;
    this.website = resume.website;
    this.visibleCourses = resume.visibleCourses ?? [];
  }
  @ApiProperty({ nullable: true, type: String })
  public avatarLink: string | null;
  @ApiProperty({ type: [Number] })
  public visibleCourses: number[];
  @ApiProperty({ nullable: true, type: String })
  public desiredPosition: string | null;
  @ApiProperty({ nullable: true, type: String })
  public email: string | null;
  @ApiProperty({ enum: LanguageLevel })
  public englishLevel: LanguageLevel;
  @ApiProperty()
  public fullTime: boolean;
  @ApiProperty({ nullable: true, type: String })
  public githubUsername: string | null;
  @ApiProperty({ nullable: true, type: String })
  public linkedin: string | null;
  @ApiProperty({ nullable: true, type: String })
  public locations: string | null;
  @ApiProperty({ enum: ['served', 'liable', 'notLiable'] })
  public militaryService: string;
  @ApiProperty({ nullable: true, type: String })
  public name: string | null;
  @ApiProperty({ nullable: true, type: String })
  public notes: string | null;
  @ApiProperty({ nullable: true, type: String })
  public phone: string | null;
  @ApiProperty({ nullable: true, type: String })
  public selfIntroLink: string | null;
  @ApiProperty({ nullable: true, type: String })
  public skype: string | null;
  @ApiProperty({ nullable: true, type: String })
  public startFrom: string | null;
  @ApiProperty({ nullable: true, type: String })
  public telegram: string | null;
  @ApiProperty({ nullable: true, type: String })
  public website: string | null;
}
