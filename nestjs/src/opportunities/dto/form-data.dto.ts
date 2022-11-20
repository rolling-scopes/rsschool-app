import { LanguageLevel } from '@entities/data';
import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsBoolean, IsString, ValidateIf } from 'class-validator';

export class FormDataDto {
  @IsString()
  @ValidateIf(value => value === null)
  @ApiProperty({ nullable: true, type: String })
  public avatarLink: string | null;

  @IsArray()
  @ApiProperty({ type: [Number] })
  public visibleCourses: number[];

  @IsString()
  @ValidateIf(value => value === null)
  @ApiProperty({ nullable: true, type: String })
  public desiredPosition: string | null;

  @IsString()
  @ValidateIf(value => value === null)
  @ApiProperty({ nullable: true, type: String })
  public email: string | null;

  @IsString()
  @ValidateIf(value => value === null)
  @ApiProperty({ enum: LanguageLevel, nullable: true })
  public englishLevel: LanguageLevel | null;

  @IsBoolean()
  @ApiProperty()
  public fullTime: boolean;

  @IsString()
  @ValidateIf(value => value === null)
  @ApiProperty({ nullable: true, type: String })
  public githubUsername: string | null;

  @IsString()
  @ValidateIf(value => value === null)
  @ApiProperty({ nullable: true, type: String })
  public linkedin: string | null;

  @IsString()
  @ValidateIf(value => value === null)
  @ApiProperty({ nullable: true, type: String })
  public locations: string | null;

  @IsString()
  @ValidateIf(value => value === null)
  @ApiProperty({ enum: ['served', 'liable', 'notLiable'], nullable: true })
  public militaryService: string | null;

  @IsString()
  @ValidateIf(value => value === null)
  @ApiProperty({ nullable: true, type: String })
  public name: string | null;

  @IsString()
  @ValidateIf(value => value === null)
  @ApiProperty({ nullable: true, type: String })
  public notes: string | null;

  @IsString()
  @ValidateIf(value => value === null)
  @ApiProperty({ nullable: true, type: String })
  public phone: string | null;

  @IsString()
  @ValidateIf(value => value === null)
  @ApiProperty({ nullable: true, type: String })
  public selfIntroLink: string | null;

  @IsString()
  @ValidateIf(value => value === null)
  @ApiProperty({ nullable: true, type: String })
  public skype: string | null;

  @IsString()
  @ValidateIf(value => value === null)
  @ApiProperty({ nullable: true, type: String })
  public startFrom: string | null;

  @IsString()
  @ValidateIf(value => value === null)
  @ApiProperty({ nullable: true, type: String })
  public telegram: string | null;

  @IsString()
  @ValidateIf(value => value === null)
  @ApiProperty({ nullable: true, type: String })
  public website: string | null;
}
