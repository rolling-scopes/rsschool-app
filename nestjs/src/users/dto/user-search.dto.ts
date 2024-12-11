import { User } from '@entities/user';
import { ApiProperty } from '@nestjs/swagger';
import { UsersService } from '../users.service';

export class CourseRecord {
  constructor(obj: { courseName: string; id: number }) {
    this.id = obj.id;
    this.courseName = obj.courseName;
  }

  @ApiProperty({ type: String })
  courseName: string;

  @ApiProperty({ type: Number })
  id: number;
}

export class UserSearchDto {
  constructor(user: User, isAdmin?: boolean) {
    this.id = user.id;
    this.name = UsersService.getFullName(user);
    this.githubId = user.githubId;

    this.primaryEmail = isAdmin ? (user.primaryEmail ?? null) : null;
    this.contactsEmail = isAdmin ? user.contactsEmail : null;
    this.contactsEpamEmail = isAdmin ? user.contactsEpamEmail : null;
    this.contactsDiscord = isAdmin ? (user.discord?.username ?? null) : null;
    this.contactsTelegram = isAdmin ? (user.contactsTelegram ?? null) : null;

    this.cityName = isAdmin ? user.cityName : null;
    this.countryName = isAdmin ? user.countryName : null;

    this.mentors =
      user.mentors?.map(mentor => ({
        id: mentor.id,
        courseName: mentor.course?.name,
      })) ?? [];

    this.students =
      user.students
        ?.filter(student => student.certificate != null)
        .map(student => ({
          id: student.id,
          courseName: student.course?.name,
        })) ?? [];
  }

  @ApiProperty()
  public id: number;

  @ApiProperty()
  public githubId: string;

  @ApiProperty()
  public name: string;

  @ApiProperty({ nullable: true, type: String })
  public cityName: string | null;

  @ApiProperty({ nullable: true, type: String })
  public countryName: string | null;

  @ApiProperty({ nullable: true, type: String })
  public contactsEmail: string | null;

  @ApiProperty({ nullable: true, type: String })
  public contactsEpamEmail: string | null;

  @ApiProperty({ nullable: true, type: String })
  public primaryEmail: string | null;

  @ApiProperty({ nullable: true, type: String })
  public contactsDiscord: string | null;

  @ApiProperty({ nullable: true, type: String })
  public contactsTelegram: string | null;

  @ApiProperty({ nullable: true, type: [CourseRecord] })
  public mentors: CourseRecord[];

  @ApiProperty({ nullable: true, type: [CourseRecord] })
  public students: CourseRecord[];
}
