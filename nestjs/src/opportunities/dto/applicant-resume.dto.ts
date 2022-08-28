import { LanguageLevel } from '@entities/data';
import { Resume } from '@entities/resume';
import { ApiProperty } from '@nestjs/swagger';
import { isExpired } from '../computed/isResumeExpired';

export class ApplicantResumeDto {
  constructor(resume: Resume) {
    this.uuid = resume.uuid;
    this.desiredPosition = resume.desiredPosition;
    this.email = resume.email;
    this.englishLevel = resume.englishLevel;
    this.fullTime = resume.fullTime;
    this.githubId = resume.user?.githubId;
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
    this.expired = isExpired(resume.updatedDate);
    this.updatedDate = resume.updatedDate;
  }
  @ApiProperty()
  public uuid: string;
  @ApiProperty()
  public avatarLink: string;
  @ApiProperty({ type: [Number] })
  public visibleCourses: number[];
  @ApiProperty()
  public desiredPosition: string;
  @ApiProperty()
  public email: string;
  @ApiProperty({ enum: LanguageLevel })
  public englishLevel: LanguageLevel;
  @ApiProperty()
  public expired: boolean;
  @ApiProperty()
  public fullTime: boolean;
  @ApiProperty()
  public githubId: string;
  @ApiProperty()
  public id: number;
  @ApiProperty()
  public linkedin: string;
  @ApiProperty()
  public locations: string;
  @ApiProperty({ enum: ['served', 'liable', 'notLiable'] })
  public militaryService: string;
  @ApiProperty()
  public name: string;
  @ApiProperty()
  public notes: string;
  @ApiProperty()
  public phone: string;
  @ApiProperty()
  public selfIntroLink: string;
  @ApiProperty()
  public skype: string;
  @ApiProperty()
  public startFrom: string;
  @ApiProperty()
  public telegram: string;
  @ApiProperty()
  public updatedDate: string;
  @ApiProperty()
  public website: string;
}
