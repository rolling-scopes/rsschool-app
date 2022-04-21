import { Feedback } from '@entities/feedback';
import { Mentor } from '@entities/mentor';
import { Resume } from '@entities/resume';
import { Student } from '@entities/student';
import { Rate, SoftSkill, StudentFeedback } from '@entities/student-feedback';
import { LanguageLevel } from '@entities/data';
import { ApiProperty } from '@nestjs/swagger';
import { PersonDto } from '../../core/dto';

class GratitudeDto {
  constructor(gratitude: Feedback) {
    this.date = gratitude.createdDate;
    this.comment = gratitude.comment ?? '';
  }

  @ApiProperty()
  public date: string;

  @ApiProperty()
  public comment: string;
}

class ResumeCourseMentor extends PersonDto {
  constructor(mentor: Mentor) {
    super(mentor.user);
    this.githubId = mentor.user.githubId;
  }

  @ApiProperty()
  public githubId: string;
}

class FeedbackCourseDto {
  constructor(feedback: StudentFeedback) {
    this.name = feedback.student.course.name;
    this.id = feedback.student.course.id;
  }

  @ApiProperty()
  public name: string;

  @ApiProperty()
  public id: number;
}

class FeedbackSoftSkill {
  constructor(id: SoftSkill, value: Rate) {
    this.id = id;
    this.value = value;
  }

  @ApiProperty({ enum: Rate })
  public value: Rate;

  @ApiProperty({ enum: SoftSkill })
  public id: SoftSkill;
}

class FeedbackDto {
  constructor(feedback: StudentFeedback) {
    this.recommendation = feedback.recommendation ?? '';
    this.recommendationComment = feedback.content?.recommendationComment ?? '';
    this.suggestions = feedback.content?.suggestions ?? '';
    this.englishLevel = feedback.englishLevel ?? LanguageLevel.Unkwown;
    this.mentor = new ResumeCourseMentor(feedback.mentor);
    this.course = new FeedbackCourseDto(feedback);
    this.softSkills = feedback.content?.softSkills.map(({ id, value }) => new FeedbackSoftSkill(id, value)) ?? [];
  }

  @ApiProperty()
  public date: string;

  @ApiProperty()
  public recommendation: string;

  @ApiProperty()
  public englishLevel: string;

  @ApiProperty()
  public recommendationComment: string;

  @ApiProperty()
  public suggestions: string;

  @ApiProperty({ type: [FeedbackSoftSkill] })
  public softSkills: FeedbackSoftSkill[];

  @ApiProperty({ type: ResumeCourseMentor })
  public mentor: ResumeCourseMentor;

  @ApiProperty({ type: FeedbackCourseDto })
  public course: FeedbackCourseDto;
}

class ResumeCourseDto {
  constructor(student: Student) {
    this.name = student.course.name;
    this.fullName = student.course.fullName;
    this.rank = student.rank;
    this.totalScore = student.totalScore;
    this.certificateId = student.certificate?.publicId ?? null;
    this.completed = student.course.completed;
    this.mentor = student.mentor ? new ResumeCourseMentor(student.mentor) : null;
    this.locationName = student.course.locationName;
    this.id = student.course.id;
  }

  @ApiProperty()
  public id: number;

  @ApiProperty()
  public name: string;

  @ApiProperty()
  public fullName: string;

  @ApiProperty()
  public rank: number;

  @ApiProperty()
  public totalScore: number;

  @ApiProperty({ nullable: true, type: String })
  public certificateId: string | null;

  @ApiProperty()
  public completed: boolean;

  @ApiProperty({ nullable: true, type: ResumeCourseMentor })
  public mentor: ResumeCourseMentor | null;

  @ApiProperty()
  public locationName: string;
}

export class ResumeDto {
  constructor(resume: Resume, students: Student[], gratitudes: Feedback[], feedbacks: StudentFeedback[]) {
    this.uuid = resume.uuid;
    this.avatarLink = resume.avatarLink;
    this.desiredPosition = resume.desiredPosition;
    this.email = resume.email;
    this.englishLevel = resume.englishLevel;
    this.expires = resume.expires;
    this.fullTime = resume.fullTime;
    this.githubUsername = resume.githubUsername;
    this.linkedin = resume.linkedin;
    this.locations = resume.locations;
    this.militaryService = resume.militaryService;
    this.name = resume.name;
    this.notes = resume.notes;
    this.phone = resume.phone;
    this.selfIntroLink = resume.selfIntroLink;
    this.skype = resume.skype;
    this.startFrom = resume.startFrom;
    this.telegram = resume.telegram;
    this.website = resume.website;
    this.visibleCourses = resume.visibleCourses ?? [];
    this.gratitudes = gratitudes.map(item => new GratitudeDto(item));
    this.courses = students.map(item => new ResumeCourseDto(item));
    this.feedbacks = feedbacks.map(item => new FeedbackDto(item));
  }
  @ApiProperty()
  public uuid: string;
  @ApiProperty()
  public avatarLink: string;
  @ApiProperty({ type: [Number] })
  public visibleCourses: number[];
  @ApiProperty({ type: [ResumeCourseDto] })
  public courses: ResumeCourseDto[];
  @ApiProperty()
  public desiredPosition: string;
  @ApiProperty()
  public email: string;
  @ApiProperty({ enum: LanguageLevel })
  public englishLevel: LanguageLevel;
  @ApiProperty()
  public expires: number;
  @ApiProperty({ type: [GratitudeDto] })
  public gratitudes: GratitudeDto[];
  @ApiProperty({ type: [FeedbackDto] })
  feedbacks: FeedbackDto[];
  @ApiProperty()
  public fullTime: boolean;
  @ApiProperty()
  public githubUsername: string;
  @ApiProperty()
  public id: number;
  @ApiProperty()
  public linkedin: string;
  @ApiProperty()
  public locations: string;
  @ApiProperty({ enum: ['served', 'liable', 'notLiable'] })
  public militaryService: string;
  @ApiProperty()
  public name: string;
  @ApiProperty()
  public notes: string;
  @ApiProperty()
  public phone: string;
  @ApiProperty()
  public selfIntroLink: string;
  @ApiProperty()
  public skype: string;
  @ApiProperty()
  public startFrom: string;
  @ApiProperty()
  public telegram: string;
  @ApiProperty()
  public website: string;
}
