import { MentorRegistry } from '@entities/mentorRegistry';
import { ApiProperty } from '@nestjs/swagger';

export class OwnMentorRegistryDto {
  constructor(mentorRegistry: MentorRegistry) {
    this.maxStudentsLimit = mentorRegistry.maxStudentsLimit;
    this.preferedStudentsLocation = mentorRegistry.preferedStudentsLocation;
    this.preselectedCourses = mentorRegistry.preselectedCourses.map(c => Number(c));
    this.preferredCourses = mentorRegistry.preferedCourses.map(c => Number(c));
  }

  @ApiProperty()
  maxStudentsLimit: number;

  @ApiProperty()
  preferedStudentsLocation: string;

  @ApiProperty({ type: [Number] })
  preselectedCourses: number[];

  @ApiProperty({ type: [Number] })
  preferredCourses: number[];
}
