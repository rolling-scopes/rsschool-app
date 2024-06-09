import { User } from '@entities/user';
import { StageInterview, StageInterviewFeedback, Mentor, Student } from '@entities/index';

import { TaskInterviewResult } from '@entities/taskInterviewResult';
import { TaskResult } from '@entities/taskResult';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Mentor as MentorWithContacts } from './dto/mentor-student-summary.dto';
import { MentorBasic, StageInterviewFeedbackJson } from '@common/models';

@Injectable()
export class CourseStudentsService {
  constructor(
    @InjectRepository(Student)
    readonly studentRepository: Repository<Student>,

    @InjectRepository(Mentor)
    readonly mentorRepository: Repository<Mentor>,
  ) {}

  async getStudentByGithubId(courseId: number, githubId: string): Promise<Student | null> {
    const record = await this.studentRepository.findOne({
      where: {
        courseId,
        user: { githubId },
      },
      relations: ['user'],
    });

    if (record == null) {
      return null;
    }
    return record;
  }

  public async getStudentScore(studentId: number) {
    const student = await this.studentRepository
      .createQueryBuilder('student')
      .leftJoinAndSelect('student.taskResults', 'taskResults')
      .leftJoin('taskResults.courseTask', 'courseTask')
      .addSelect(['courseTask.disabled', 'courseTask.id'])
      .leftJoinAndSelect('student.taskInterviewResults', 'taskInterviewResults')
      .leftJoin('student.stageInterviews', 'si')
      .leftJoin('si.stageInterviewFeedbacks', 'sif')
      .addSelect([
        'sif.stageInterviewId',
        'sif.json',
        'si.isCompleted',
        'si.id',
        'si.courseTaskId',
        'si.score',
        'sif.version',
      ])
      .where('student.id = :studentId', { studentId })
      .getOne();

    if (!student) return null;

    const { taskResults, taskInterviewResults, stageInterviews } = student;

    const toTaskScore = ({ courseTaskId, score = 0 }: TaskResult | TaskInterviewResult) => ({ courseTaskId, score });

    const results = [];

    if (taskResults?.length) {
      results.push(...(taskResults.filter(taskResult => !taskResult.courseTask.disabled).map(toTaskScore) ?? []));
    }

    if (taskInterviewResults?.length) {
      results.push(...taskInterviewResults.map(toTaskScore));
    }

    // we have a case when technical screening score are set as task result.
    if (stageInterviews?.length && !results.find(tr => tr.courseTaskId === stageInterviews[0]?.courseTaskId)) {
      const feedbackVersion = stageInterviews[0]?.stageInterviewFeedbacks[0]?.version;
      const score = !feedbackVersion
        ? Math.floor(getStageInterviewRating(stageInterviews) ?? 0)
        : stageInterviews[0]?.score;

      results.push({
        score,
        courseTaskId: stageInterviews[0]?.courseTaskId,
      });
    }

    return {
      totalScore: student.totalScore,
      rank: student.rank ?? 999999,
      results,
    };
  }

  async getMentorWithContacts(mentorId: number): Promise<MentorWithContacts> {
    const record = await this.mentorRepository.findOne({
      relations: ['user'],
      where: {
        id: mentorId,
      },
    });

    if (!record) {
      throw new NotFoundException(`Mentor not found ${mentorId}`);
    }

    const mentor = convertToMentorBasic(record);
    const user = record.user as User;
    const mentorWithContacts: MentorWithContacts = {
      ...mentor,
      contactsEmail: user.contactsEmail,
      contactsSkype: user.contactsSkype,
      contactsWhatsApp: user.contactsWhatsApp,
      contactsTelegram: user.contactsTelegram,
      contactsNotes: user.contactsNotes,
      contactsPhone: null,
    };
    return mentorWithContacts;
  }
}

const getStageInterviewRating = (stageInterviews: StageInterview[]) => {
  const [lastInterview] = stageInterviews
    .filter((interview: StageInterview) => interview.isCompleted)
    .map(({ stageInterviewFeedbacks, score }: StageInterview) =>
      stageInterviewFeedbacks.map((feedback: StageInterviewFeedback) => ({
        date: feedback.updatedDate,
        // interviews in new template should have precalculated score
        rating: score ?? getInterviewRatings(JSON.parse(feedback.json) as StageInterviewFeedbackJson).rating,
      })),
    )
    .reduce((acc, cur) => acc.concat(cur), [])
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return lastInterview?.rating ?? null;
};

export function getInterviewRatings({ skills, programmingTask, resume }: StageInterviewFeedbackJson) {
  const commonSkills = Object.values(skills?.common ?? {}).filter(Boolean) as number[];
  const dataStructuresSkills = Object.values(skills?.dataStructures ?? {}).filter(Boolean) as number[];

  const htmlCss = skills?.htmlCss.level;
  const common = commonSkills.reduce((acc, cur) => acc + cur, 0) / commonSkills.length;
  const dataStructures = dataStructuresSkills.reduce((acc, cur) => acc + cur, 0) / dataStructuresSkills.length;

  if (resume?.score !== undefined) {
    const rating = resume.score;
    return { rating, htmlCss, common, dataStructures };
  }

  const ratingsCount = 4;
  const ratings = [htmlCss, common, dataStructures, programmingTask.codeWritingLevel].filter(Boolean) as number[];
  const rating = (ratings.length === ratingsCount ? ratings.reduce((sum, num) => sum + num) / ratingsCount : 0) * 10;

  return { rating, htmlCss, common, dataStructures };
}

export function convertToMentorBasic(mentor: Mentor): MentorBasic {
  const { user, isExpelled, id, students } = mentor;
  return {
    isActive: !isExpelled,
    name: createName(user),
    id: id,
    githubId: user.githubId,
    students: students ? students.filter(s => !s.isExpelled && !s.isFailed).map(s => ({ id: s.id })) : [],
    cityName: user.cityName ?? '',
    countryName: user.countryName ?? '',
  };
}

export function createName({ firstName, lastName }: { firstName: string; lastName: string }) {
  const result = [];
  if (firstName) {
    result.push(firstName.trim());
  }
  if (lastName) {
    result.push(lastName.trim());
  }
  return result.join(' ');
}
