import { MentorRegistry } from '@entities/mentorRegistry';
import { ApiProperty } from '@nestjs/swagger';
import { PersonDto } from 'src/core/dto';

export class MentorRegistryDto {
  constructor(mentorRegistry: MentorRegistry) {
    this.id = mentorRegistry.id;
    this.englishMentoring = mentorRegistry.englishMentoring;
    this.githubId = mentorRegistry.user.githubId;
    this.cityName = mentorRegistry.user.cityName;
    this.preferedCourses = mentorRegistry.preferedCourses.map(id => Number(id));
    this.preselectedCourses = mentorRegistry.preselectedCourses.map(id => Number(id));
    this.maxStudentsLimit = mentorRegistry.maxStudentsLimit;
    this.preferedStudentsLocation = mentorRegistry.preferedStudentsLocation;
    this.name = PersonDto.getName({ firstName: mentorRegistry.user.firstName, lastName: mentorRegistry.user.lastName });
    this.technicalMentoring = mentorRegistry.technicalMentoring;
    this.courses = mentorRegistry.user.mentors?.map(m => m.courseId);
    this.sendDate = mentorRegistry.sendDate ?? mentorRegistry.updatedDate;
    this.hasCertificate = mentorRegistry.user.students?.some(s => s.certificate?.id);
    this.primaryEmail = mentorRegistry.user.primaryEmail ?? null;
    this.languagesMentoring = mentorRegistry.languagesMentoring;
    this.contactsEpamEmail = mentorRegistry.user.contactsEpamEmail;
    this.receivedDate = mentorRegistry.createdDate;
    this.comment = mentorRegistry.comment;
  }

  @ApiProperty()
  public id: number;

  @ApiProperty()
  public githubId: string;

  @ApiProperty({ type: String, nullable: true })
  public cityName: string | null;

  @ApiProperty({ type: [Number] })
  preferedCourses: number[];

  @ApiProperty({ type: [Number] })
  preselectedCourses: number[];

  @ApiProperty()
  public maxStudentsLimit: number;

  @ApiProperty()
  public preferedStudentsLocation: string;

  @ApiProperty()
  public name: string;

  @ApiProperty()
  public technicalMentoring: string[];

  @ApiProperty({ type: [Number] })
  public courses?: number[];

  @ApiProperty()
  public sendDate: Date;

  @ApiProperty()
  public receivedDate: Date;

  @ApiProperty()
  public hasCertificate?: boolean;

  @ApiProperty()
  public englishMentoring: boolean;

  @ApiProperty()
  public primaryEmail: string | null;

  @ApiProperty({ type: [String] })
  public languagesMentoring: string[];

  @ApiProperty({ type: String, nullable: true })
  public contactsEpamEmail: string | null;

  @ApiProperty({ type: String, nullable: true })
  public comment: string | null;
}
