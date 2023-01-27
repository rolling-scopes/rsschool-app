import { Student } from '@entities/index';
import { ApiProperty } from '@nestjs/swagger';
import { PersonDto } from 'src/core/dto';
import { PaginationMeta } from 'src/core/paginate';
import { PaginationMetaDto } from 'src/core/paginate/dto/Paginate.dto';

export class TeamDistributionStudentDto {
  constructor(student: Student) {
    this.id = student.id;
    this.fullName = PersonDto.getName({ firstName: student.user.firstName, lastName: student.user.lastName });
    this.cvLink = student.user.cvLink ?? undefined;
    this.discord = student.user.discord
      ? `${student.user.discord.username}#${student.user.discord.discriminator}`
      : undefined;
    this.telegram = student.user.contactsTelegram ?? undefined;
    this.email = student.user.contactsEmail ?? undefined;
    this.githubId = student.user.githubId;
    this.rank = student.rank;
    this.totalScore = student.totalScore;
    this.location = `${student.user.cityName ? `${student.user.cityName},` : ''}${
      student.user.countryName ? ` ${student.user.countryName}` : ''
    }`;
    this.cvUuid = student.user.resume?.find(e => e.userId === student.user.id)?.uuid ?? undefined;
  }

  @ApiProperty()
  public id: number;

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

  @ApiProperty()
  public cvUuid?: string;
}

export class StudentsWithoutTeamDto {
  constructor(students: Student[], paginationMeta: PaginationMeta) {
    this.content = students.map(s => new TeamDistributionStudentDto(s));
    this.pagination = new PaginationMetaDto(paginationMeta);
  }

  @ApiProperty({ type: [TeamDistributionStudentDto] })
  content: TeamDistributionStudentDto[];

  @ApiProperty({ type: PaginationMetaDto })
  pagination: PaginationMetaDto;
}
