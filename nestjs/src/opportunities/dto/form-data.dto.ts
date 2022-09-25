import { Resume } from '@entities/resume';
import { LanguageLevel } from '@entities/data';
import { ApiProperty } from '@nestjs/swagger';

type FormData = Omit<Resume, 'uuid' | 'updatedDate' | 'user' | 'userId' | 'isHidden' | 'githubId' | 'expires' | 'id'>;
export class FormDataDto {
  constructor(formData: FormData) {
    this.avatarLink = formData.avatarLink;
    this.desiredPosition = formData.desiredPosition;
    this.email = formData.email;
    this.englishLevel = formData.englishLevel;
    this.fullTime = formData.fullTime;
    this.githubUsername = formData.githubUsername;
    this.linkedin = formData.linkedin;
    this.locations = formData.locations;
    this.militaryService = formData.militaryService;
    this.name = formData.name;
    this.notes = formData.notes;
    this.phone = formData.phone;
    this.selfIntroLink = formData.selfIntroLink;
    this.skype = formData.skype;
    this.startFrom = formData.startFrom;
    this.telegram = formData.telegram;
    this.website = formData.website;
    this.visibleCourses = formData.visibleCourses ?? [];
  }
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
  @ApiProperty()
  public fullTime: boolean;
  @ApiProperty({ nullable: true, type: String })
  public githubUsername: string | null;
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
