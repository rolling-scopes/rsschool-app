import { LanguageLevel } from '@entities/data';
import { ApiProperty } from '@nestjs/swagger';

//type FormData = Omit<Resume, 'uuid' | 'updatedDate' | 'user' | 'userId' | 'isHidden' | 'githubId' | 'expires' | 'id'>;
export class FormDataDto {
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
