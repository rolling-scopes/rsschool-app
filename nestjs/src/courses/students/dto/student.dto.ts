import { Student } from '@entities/student';
import { ApiProperty, ApiResponse } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';
import { PersonDto } from '../../../core/dto';

@ApiResponse({})
export class StudentDto extends PersonDto {
  constructor(student: Student) {
    super({ id: student.id, firstName: student.user.firstName, lastName: student.user.firstName });
    this.active = !student.isExpelled;
    this.cityName = student.user.cityName;
    this.countryName = student.user.countryName;
    this.githubId = student.user.githubId;
    this.rank = student.rank;
    this.totalScore = student.totalScore;
  }

  @IsNotEmpty()
  active: boolean;

  @ApiProperty()
  cityName: string;

  @ApiProperty()
  countryName: string;

  @ApiProperty()
  githubId: string;

  @ApiProperty()
  totalScore: number;

  @ApiProperty()
  rank: number;
}
