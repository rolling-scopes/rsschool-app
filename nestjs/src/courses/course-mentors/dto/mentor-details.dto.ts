import { InterviewStatistics, MentorDetails } from '@common/models';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserDto } from '../../../users/dto';
import { PreferredStudentsLocation } from '@entities/mentorRegistry';

class StudentId {
  @ApiProperty()
  id: number;
}

export class MentorDetailsDto extends UserDto {
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
  public isActive: boolean;

  @ApiProperty()
  public cityName: string;

  @ApiProperty()
  public countryName: string;

  @ApiProperty()
  public maxStudentsLimit: number;

  @ApiProperty({ type: [StudentId] })
  public students: { id: number }[];

  @ApiPropertyOptional()
  public interviews?: InterviewStatistics;

  @ApiPropertyOptional()
  public screenings?: InterviewStatistics;

  @ApiPropertyOptional()
  public taskResultsStats?: {
    lastUpdatedDate?: Date | string | null;
    total: number;
    checked: number;
  };

  @ApiProperty({ enum: PreferredStudentsLocation })
  public studentsPreference: PreferredStudentsLocation;

  @ApiPropertyOptional()
  public studentsCount?: number;

  @ApiProperty()
  public contactsEpamEmail: string;
}
