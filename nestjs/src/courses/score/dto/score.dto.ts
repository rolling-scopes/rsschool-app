import { ApiProperty, ApiResponse } from '@nestjs/swagger';

import { Student } from '@entities/student';
import { User } from '@entities/user';

import { StudentDto } from 'src/courses/students/dto';
import { PaginationMetaDto } from 'src/lib/paginate/dto/Paginate.dto';
import { PaginationMeta } from 'src/lib/paginate';
import { Contacts } from '@common/models';
import { IsOptional, IsString } from 'class-validator';

class MentorDto {
  constructor(mentor: { id: number; githubId: string; name: string }) {
    this.id = mentor.id;
    this.githubId = mentor.githubId;
    this.name = mentor.name;
  }

  @ApiProperty()
  id: number;

  @ApiProperty()
  githubId: string;

  @ApiProperty()
  name: string;
}

class TaskResultsDto {
  constructor(task: { courseTaskId: number; score: number }) {
    this.courseTaskId = task.courseTaskId;
    this.score = task.score;
  }

  @ApiProperty()
  courseTaskId: number;

  @ApiProperty()
  score: number;
}

export class ContactsDto implements Contacts {
  constructor(contacts: Partial<Contacts>) {
    this.phone = contacts.phone || null;
    this.email = contacts.email || null;
    this.skype = contacts.skype || null;
    this.telegram = contacts.telegram || null;
    this.notes = contacts.notes || null;
    this.linkedIn = contacts.linkedIn || null;
  }

  @ApiProperty({ required: false, nullable: true, type: String })
  @IsOptional()
  @IsString()
  phone: string | null;

  @ApiProperty({ required: false, nullable: true, type: String })
  @IsOptional()
  @IsString()
  email: string | null;

  @ApiProperty({ required: false, nullable: true, type: String })
  @IsOptional()
  @IsString()
  epamEmail: string | null;

  @ApiProperty({ required: false, nullable: true, type: String })
  @IsOptional()
  @IsString()
  skype: string | null;

  @ApiProperty({ required: false, nullable: true, type: String })
  @IsOptional()
  @IsString()
  telegram: string | null;

  @ApiProperty({ required: false, nullable: true, type: String })
  @IsOptional()
  @IsString()
  notes: string | null;

  @ApiProperty({ required: false, nullable: true, type: String })
  @IsOptional()
  @IsString()
  linkedIn: string | null;

  @ApiProperty({ required: false, nullable: true, type: String })
  @IsOptional()
  @IsString()
  discord: string | null;
}

export class ScoreStudentDto extends StudentDto {
  constructor(
    student: Student,
    user: User,
    mentor:
      | {
          id: number;
          githubId: string;
          name: string;
        }
      | undefined,
    taskResults: {
      courseTaskId: number;
      score: number;
    }[],
    contacts: Partial<Contacts> | undefined,
  ) {
    super(student);
    this.mentor = mentor ? new MentorDto(mentor) : undefined;
    this.githubId = user.githubId;
    this.totalScoreChangeDate = student.totalScoreChangeDate;
    this.crossCheckScore = student.crossCheckScore;
    this.repositoryLastActivityDate = student.repositoryLastActivityDate;
    this.taskResults = taskResults.map(taskResult => new TaskResultsDto(taskResult));
    this.isActive = !student.isExpelled && !student.isFailed;
    this.contacts = contacts && new ContactsDto(contacts);
  }

  @ApiProperty({ type: MentorDto, nullable: true })
  mentor: MentorDto | undefined;

  @ApiProperty({ type: String })
  name: string;

  @ApiProperty()
  githubId: string;

  @ApiProperty({ type: Date })
  totalScoreChangeDate: Date;

  @ApiProperty({ type: Number })
  crossCheckScore: number;

  @ApiProperty({ type: Date })
  repositoryLastActivityDate: Date;

  @ApiProperty({ type: [TaskResultsDto] })
  taskResults: TaskResultsDto[];

  @ApiProperty({ type: Boolean })
  isActive: boolean;

  @ApiProperty({ type: ContactsDto })
  contacts: ContactsDto | undefined;
}

@ApiResponse({})
export class ScoreDto {
  constructor(students: ScoreStudentDto[], paginationMeta: PaginationMeta) {
    this.content = students;
    this.pagination = new PaginationMetaDto(paginationMeta);
  }

  @ApiProperty({ type: [ScoreStudentDto] })
  content: ScoreStudentDto[];

  @ApiProperty({ type: PaginationMetaDto })
  pagination: PaginationMetaDto;
}
