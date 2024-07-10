import { ApiProperty, ApiResponse } from '@nestjs/swagger';
import { PaginationMeta } from 'src/core/paginate';
import { PaginationMetaDto } from 'src/core/paginate/dto/Paginate.dto';
import { Student, User } from '@entities/index';
import { PersonDto } from 'src/core/dto';
import { Discord } from 'src/profile/dto';

class UserStudentCourseDto {
  constructor(student: Student) {
    this.alias = student.course.alias;
    this.name = student.course.name;
    this.completed = student.course.completed;
    this.studentIsExpelled = student.isExpelled;
    this.certificateId = student.certificate?.publicId;
    this.hasCertificate = Boolean(student.certificate?.publicId);
    this.mentorGithubId = student.mentor?.user.githubId;
    this.mentorFullName = PersonDto.getName({
      firstName: student.mentor?.user.firstName,
      lastName: student.mentor?.user.lastName,
    });
    this.totalScore = student.totalScore;
    this.rank = student.rank;
  }

  @ApiProperty()
  alias: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  hasCertificate: boolean;

  @ApiProperty()
  completed: boolean;

  @ApiProperty()
  studentIsExpelled: boolean;

  @ApiProperty()
  certificateId?: string;

  @ApiProperty()
  mentorGithubId?: string;

  @ApiProperty()
  mentorFullName?: string;

  @ApiProperty()
  totalScore: number;

  @ApiProperty()
  rank: number;
}

class UserStudentDto {
  constructor(user: User) {
    this.id = user.id;
    this.githubId = user.githubId;
    this.fullName = PersonDto.getName({ firstName: user.firstName, lastName: user.lastName });
    this.country = user.countryName;
    this.city = user.cityName;
    this.languages = user.languages;
    this.contactsEmail = user.contactsEmail ?? undefined;
    this.contactsTelegram = user.contactsTelegram ?? undefined;
    this.contactsLinkedIn = user.contactsLinkedIn ?? undefined;
    this.contactsSkype = user.contactsSkype ?? undefined;
    this.contactsPhone = user.contactsPhone ?? undefined;
    this.discord = user.discord ?? undefined;

    this.onGoingCourses =
      user.students?.filter(student => !student.course.completed)?.map(student => new UserStudentCourseDto(student)) ??
      [];
    this.previousCourses =
      user.students?.filter(student => student.course.completed)?.map(student => new UserStudentCourseDto(student)) ??
      [];
  }

  @ApiProperty({ description: 'User id' })
  id: number;

  @ApiProperty({ description: 'User github id' })
  githubId: string;

  @ApiProperty({ description: 'User full name' })
  fullName: string;

  @ApiProperty({ description: 'User country' })
  country: string | null;

  @ApiProperty({ description: 'User city' })
  city: string | null;

  @ApiProperty({ description: 'User email' })
  contactsEmail?: string;

  @ApiProperty({ description: 'User telegram' })
  contactsTelegram?: string;

  @ApiProperty({ description: 'User linkedIn' })
  contactsLinkedIn?: string;

  @ApiProperty({ description: 'User skype' })
  contactsSkype?: string;

  @ApiProperty({ description: 'User phone' })
  contactsPhone?: string;

  @ApiProperty({ description: 'User discord', type: Discord })
  discord?: Discord;

  @ApiProperty({ description: 'User on going courses', type: [UserStudentCourseDto] })
  onGoingCourses: UserStudentCourseDto[];

  @ApiProperty({ description: 'User previous courses', type: [UserStudentCourseDto] })
  previousCourses: UserStudentCourseDto[];

  @ApiProperty({ description: 'User languages' })
  languages: string[];
}

@ApiResponse({})
export class UserStudentsDto {
  constructor(data: { items: User[]; meta: PaginationMeta }) {
    this.content = data.items.map(user => new UserStudentDto(user));
    this.pagination = new PaginationMetaDto(data.meta);
  }

  @ApiProperty({ type: [UserStudentDto] })
  content: UserStudentDto[];

  @ApiProperty({ type: PaginationMetaDto })
  pagination: PaginationMetaDto;
}
