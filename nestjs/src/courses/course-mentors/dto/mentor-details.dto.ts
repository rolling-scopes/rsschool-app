import { PreferredStudentsLocation } from '@common/enums/mentor';
import { InterviewStatistics, MentorDetails } from '@common/models';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { StudentDto } from '../../../courses/students/dto';
import { UserDto } from '../../../user-groups/dto';

export class MentorDetailsDto extends UserDto implements MentorDetails {
  constructor(mentor: MentorDetails) {
    super(mentor);

    this.isActive = mentor.isActive;
    this.cityName = mentor.cityName;
    this.countryName = mentor.countryName;
    this.students = mentor.students;
    this.interviews = mentor.interviews;
    this.screenings = mentor.screenings;
    this.taskResultsStats = mentor.taskResultsStats;
    this.maxStudentsLimit = mentor.maxStudentsLimit;
    this.studentsPreference = mentor.studentsPreference as PreferredStudentsLocation;
    this.studentsCount = mentor.studentsCount;
  }

  @ApiProperty()
  isActive: boolean;

  @ApiProperty()
  cityName: string;

  @ApiProperty()
  countryName: string;

  @ApiProperty()
  maxStudentsLimit: number;

  @ApiProperty({ type: [StudentDto] })
  students: (StudentDto | { id: number })[];

  @ApiPropertyOptional()
  interviews?: InterviewStatistics;

  @ApiPropertyOptional()
  screenings?: InterviewStatistics;

  @ApiPropertyOptional()
  taskResultsStats?: {
    lastUpdatedDate?: Date | null;
    total: number;
    checked: number;
  };

  @ApiProperty({ enum: PreferredStudentsLocation })
  studentsPreference: PreferredStudentsLocation;

  @ApiPropertyOptional()
  studentsCount?: number;

  public contactsEpamEmail: string;
}
