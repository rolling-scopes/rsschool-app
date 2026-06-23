import { Registry } from '@entities/registry';
import { User } from '@entities/user';
import { Mentor } from '@entities/mentor';
import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsIn, IsNotEmpty } from 'class-validator';

export class RegistrationUserDto {
  constructor(user: User | null) {
    this.githubId = user?.githubId ?? '';
    this.firstName = user?.firstName ?? null;
    this.lastName = user?.lastName ?? null;
    this.contactsEpamEmail = user?.contactsEpamEmail ?? null;
    this.locationName = user?.locationName ?? null;
  }

  @ApiProperty()
  githubId: string;

  @ApiProperty({ nullable: true, type: String })
  firstName: string | null;

  @ApiProperty({ nullable: true, type: String })
  lastName: string | null;

  @ApiProperty({ nullable: true, type: String })
  contactsEpamEmail: string | null;

  @ApiProperty({ nullable: true, type: String })
  locationName: string | null;
}

export class RegistrationDto {
  constructor(registry: Registry) {
    this.id = registry.id;
    this.type = registry.type;
    this.status = registry.status;
    this.userId = registry.userId;
    this.courseId = registry.courseId;
    this.attributes = registry.attributes ?? {};
    this.user = new RegistrationUserDto(typeof registry.user === 'object' ? registry.user : null);
  }

  @ApiProperty()
  id: number;

  @ApiProperty()
  type: string;

  @ApiProperty()
  status: string;

  @ApiProperty()
  userId: number;

  @ApiProperty()
  courseId: number;

  @ApiProperty({ type: Object })
  attributes: object;

  @ApiProperty({ type: RegistrationUserDto })
  user: RegistrationUserDto;
}

export class UpdateRegistrationsDto {
  @ApiProperty({ type: [Number] })
  @IsArray()
  @IsNotEmpty()
  ids: number[];

  @ApiProperty({ enum: ['inactive', 'pending', 'approved', 'rejected'] })
  @IsIn(['inactive', 'pending', 'approved', 'rejected'])
  status: 'inactive' | 'pending' | 'approved' | 'rejected';
}

export class UpdatedRegistrationMentorDto {
  constructor(mentor: Mentor) {
    this.id = mentor.id;
    this.userId = mentor.userId;
    this.courseId = mentor.courseId;
    this.maxStudentsLimit = mentor.maxStudentsLimit;
  }

  @ApiProperty()
  id: number;

  @ApiProperty()
  userId: number;

  @ApiProperty()
  courseId: number;

  @ApiProperty({ nullable: true, type: Number })
  maxStudentsLimit: number | null;
}

export class UpdateRegistrationsResponseDto {
  constructor(data: { registries: Mentor[] }) {
    this.registries = data.registries.map(mentor => new UpdatedRegistrationMentorDto(mentor));
  }

  @ApiProperty({ type: [UpdatedRegistrationMentorDto] })
  registries: UpdatedRegistrationMentorDto[];
}
