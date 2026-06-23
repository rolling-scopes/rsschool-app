import { User } from '@entities/user';
import { ApiProperty } from '@nestjs/swagger';

export class MyProfileDto {
  constructor(user: User) {
    this.id = user.id;
    this.githubId = user.githubId;
    this.firstName = user.firstName ?? null;
    this.lastName = user.lastName ?? null;
    this.primaryEmail = user.primaryEmail ?? null;
    this.contactsEpamEmail = user.contactsEpamEmail ?? null;
    this.contactsEmail = user.contactsEmail ?? null;
    this.contactsPhone = user.contactsPhone ?? null;
    this.contactsTelegram = user.contactsTelegram ?? null;
    this.contactsSkype = user.contactsSkype ?? null;
    this.contactsWhatsApp = user.contactsWhatsApp ?? null;
    this.contactsNotes = user.contactsNotes ?? null;
    this.cityName = user.cityName ?? null;
    this.countryName = user.countryName ?? null;
    this.locationId = user.locationId ?? null;
    this.locationName = user.locationName ?? null;
    this.aboutMyself = user.aboutMyself ?? null;
    this.tshirtSize = user.tshirtSize ?? null;
    this.englishLevel = user.englishLevel ?? null;
    this.educationHistory = user.educationHistory ?? [];
    this.employmentHistory = user.employmentHistory ?? [];
    this.externalAccounts = user.externalAccounts ?? [];
    this.languages = user.languages ?? [];
    this.discord = user.discord ? `${user.discord.username}#${user.discord.discriminator}` : null;
  }

  @ApiProperty()
  id: number;

  @ApiProperty()
  githubId: string;

  @ApiProperty({ nullable: true, type: String })
  firstName: string | null;

  @ApiProperty({ nullable: true, type: String })
  lastName: string | null;

  @ApiProperty({ nullable: true, type: String })
  primaryEmail: string | null;

  @ApiProperty({ nullable: true, type: String })
  contactsEpamEmail: string | null;

  @ApiProperty({ nullable: true, type: String })
  contactsEmail: string | null;

  @ApiProperty({ nullable: true, type: String })
  contactsPhone: string | null;

  @ApiProperty({ nullable: true, type: String })
  contactsTelegram: string | null;

  @ApiProperty({ nullable: true, type: String })
  contactsSkype: string | null;

  @ApiProperty({ nullable: true, type: String })
  contactsWhatsApp: string | null;

  @ApiProperty({ nullable: true, type: String })
  contactsNotes: string | null;

  @ApiProperty({ nullable: true, type: String })
  cityName: string | null;

  @ApiProperty({ nullable: true, type: String })
  countryName: string | null;

  @ApiProperty({ nullable: true, type: String })
  locationId: string | null;

  @ApiProperty({ nullable: true, type: String })
  locationName: string | null;

  @ApiProperty({ nullable: true, type: String })
  aboutMyself: string | null;

  @ApiProperty({ nullable: true, type: String })
  tshirtSize: string | null;

  @ApiProperty({ nullable: true, type: String })
  englishLevel: string | null;

  @ApiProperty({ type: [Object] })
  educationHistory: object[];

  @ApiProperty({ type: [Object] })
  employmentHistory: object[];

  @ApiProperty({ type: [Object] })
  externalAccounts: object[];

  @ApiProperty({ type: [String] })
  languages: string[];

  @ApiProperty({ nullable: true, type: String })
  discord: string | null;
}
