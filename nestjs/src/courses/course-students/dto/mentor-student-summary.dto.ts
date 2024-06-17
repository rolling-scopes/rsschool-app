import { MentorBasic, StudentBasic } from '@common/models';
import { ApiProperty } from '@nestjs/swagger';

export type Mentor = MentorBasic & {
  contactsEmail: string | null;
  contactsPhone: string | null;
  contactsSkype: string | null;
  contactsTelegram: string | null;
  contactsNotes: string | null;
  contactsWhatsApp: string | null;
};

export class MentorStudentSummaryDto {
  constructor(mentor: Mentor) {
    this.id = mentor.id;
    this.githubId = mentor.githubId;
    this.name = mentor.name;
    this.isActive = mentor.isActive;
    this.cityName = mentor.cityName;
    this.countryName = mentor.countryName;
    this.students = mentor.students;
    this.contactsEmail = mentor.contactsEmail;
    this.contactsPhone = mentor.contactsPhone;
    this.contactsSkype = mentor.contactsSkype;
    this.contactsTelegram = mentor.contactsTelegram;
    this.contactsNotes = mentor.contactsNotes;
    this.contactsWhatsApp = mentor.contactsWhatsApp;
  }

  @ApiProperty({ type: Number })
  id: number;

  @ApiProperty({ type: String })
  githubId: string;

  @ApiProperty({ type: String })
  name: string;

  @ApiProperty({ type: Boolean })
  isActive: boolean;

  @ApiProperty({ type: String })
  cityName: string;

  @ApiProperty({ type: String })
  countryName: string;

  @ApiProperty({ type: Array<StudentBasic | { id: number }> })
  students: (StudentBasic | { id: number })[];

  @ApiProperty({ type: String, nullable: true })
  contactsEmail: string | null;

  @ApiProperty({ type: String, nullable: true })
  contactsPhone: string | null;

  @ApiProperty({ type: String, nullable: true })
  contactsSkype: string | null;

  @ApiProperty({ type: String, nullable: true })
  contactsTelegram: string | null;

  @ApiProperty({ type: String, nullable: true })
  contactsNotes: string | null;

  @ApiProperty({ type: String, nullable: true })
  contactsWhatsApp: string | null;
}
