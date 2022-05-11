import { Student } from '@entities/student';
import { ApiProperty, ApiResponse } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';
import { PersonDto } from '../../../core/dto';

@ApiResponse({})
export class StudentDto extends PersonDto {
  constructor(student: Student) {
    super({
      id: student.id,
      firstName: student.user.firstName,
      lastName: student.user.firstName,
      githubId: student.user.githubId,
    });
    this.active = !student.isExpelled;
    this.cityName = student.user.cityName ?? null;
    this.countryName = student.user.countryName ?? null;
    this.rank = student.rank;
    this.totalScore = student.totalScore;
  }

  @IsNotEmpty()
  @ApiProperty()
  active: boolean;

  @ApiProperty({ type: String, nullable: true })
  cityName: string | null;

  @ApiProperty({ type: String, nullable: true })
  countryName: string | null;

  @ApiProperty()
  totalScore: number;

  @ApiProperty()
  rank: number;
}
