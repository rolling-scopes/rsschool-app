import { Student } from '@entities/index';
import { ApiProperty } from '@nestjs/swagger';

export class TeamDistributionStudentDto {
  constructor(student: Student) {
    this.fullName = `${student.user.firstName} ${student.user.lastName}`;
    this.cvLink = student.user.cvLink ?? undefined;
    this.discord = student.user.discord
      ? `${student.user.discord.username}#${student.user.discord.discriminator}`
      : undefined;
    this.telegram = student.user.contactsTelegram ?? undefined;
    this.email = student.user.contactsEmail ?? undefined;
    this.githubId = student.user.githubId;
    this.rank = student.rank;
    this.totalScore = student.totalScore;
    this.location = `${student.user.cityName}, ${student.user.countryName}`;
  }

  @ApiProperty()
  public fullName: string;

  @ApiProperty()
  public cvLink?: string;

  @ApiProperty()
  public discord?: string;

  @ApiProperty()
  public telegram?: string;

  @ApiProperty()
  public email?: string;

  @ApiProperty()
  public githubId: string;

  @ApiProperty()
  public rank: number;

  @ApiProperty()
  public totalScore: number;

  @ApiProperty()
  public location: string;
}
