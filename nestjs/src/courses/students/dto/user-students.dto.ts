import { ApiProperty, ApiResponse } from '@nestjs/swagger';
import { PaginationMeta } from 'src/core/paginate';
import { PaginationMetaDto } from 'src/core/paginate/dto/Paginate.dto';
import { Student, User } from '@entities/index';
import { PersonDto } from 'src/core/dto';

class UserStudentCourseDto {
  constructor(student: Student) {
    this.alias = student.course.alias;
    this.name = student.course.name;
    this.hasCertificate = Boolean(student.certificate?.publicId);
  }
  @ApiProperty()
  alias: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  hasCertificate: boolean;
}

class UserStudentDto {
  constructor(user: User) {
    this.id = user.id;
    this.githubId = user.githubId;
    this.fullName = PersonDto.getName({ firstName: user.firstName, lastName: user.lastName });
    this.country = user.countryName;
    this.city = user.cityName;
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

  @ApiProperty({ description: 'User on going courses', type: [UserStudentCourseDto] })
  onGoingCourses: UserStudentCourseDto[];

  @ApiProperty({ description: 'User previous courses', type: [UserStudentCourseDto] })
  previousCourses: UserStudentCourseDto[];
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
