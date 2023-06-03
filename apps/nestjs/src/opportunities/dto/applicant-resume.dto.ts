import { LanguageLevel } from '@entities/data';
import { Resume } from '@entities/resume';
import { ApiProperty } from '@nestjs/swagger';

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
    this.expires = Number(resume.expires);
  }

  @ApiProperty()
  public uuid: string;

  @ApiProperty({ nullable: true, type: String })
  public avatarLink: string | null;

  @ApiProperty({ type: [Number] })
  public visibleCourses: number[];

  @ApiProperty({ nullable: true, type: String })
  public desiredPosition: string | null;

  @ApiProperty({ nullable: true, type: String })
  public email: string | null;

  @ApiProperty({ enum: LanguageLevel, nullable: true })
  public englishLevel: LanguageLevel | null;

  @ApiProperty({ nullable: true, type: Number })
  public expires: number | null;

  @ApiProperty()
  public fullTime: boolean;

  @ApiProperty()
  public githubId: string;

  @ApiProperty()
  public id: number;

  @ApiProperty({ nullable: true, type: String })
  public linkedin: string | null;

  @ApiProperty({ nullable: true, type: String })
  public locations: string | null;

  @ApiProperty({ enum: ['served', 'liable', 'notLiable'], nullable: true })
  public militaryService: string | null;

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
