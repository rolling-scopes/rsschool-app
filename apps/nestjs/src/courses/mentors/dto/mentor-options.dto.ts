import { Student } from '@entities/index';
import { Mentor } from '@entities/mentor';
import { PreferredStudentsLocation } from '@common/enums/mentor';
import { ApiProperty, ApiResponse } from '@nestjs/swagger';
import { IsArray, IsNumber, IsString } from 'class-validator';
import { PersonDto } from 'src/core/dto';

type StudentInput = Student & { user: { githubId: string; firstName: string; lastName: string } };

class StudentsDto {
  @ApiProperty()
  @IsNumber()
  id: number;

  @ApiProperty()
  @IsString()
  githubId: string;

  @ApiProperty()
  @IsString()
  name: string;

  constructor(student: StudentInput) {
    this.id = student.id;
    this.githubId = student.user.githubId;
    this.name = PersonDto.getName(student.user);
  }
}

@ApiResponse({})
export class MentorOptionsDto {
  constructor(
    mentor: Omit<Mentor, 'students'> & {
      students: StudentInput[];
    },
  ) {
    this.maxStudentsLimit = mentor.maxStudentsLimit;
    this.preferedStudentsLocation = mentor.studentsPreference as PreferredStudentsLocation;
    this.students = mentor.students.map(student => new StudentsDto(student));
  }

  @ApiProperty()
  @IsNumber()
  maxStudentsLimit: number;

  @ApiProperty({ enum: PreferredStudentsLocation })
  preferedStudentsLocation: PreferredStudentsLocation;

  @ApiProperty({ type: [StudentsDto] })
  @IsArray()
  students: StudentsDto[];
}
