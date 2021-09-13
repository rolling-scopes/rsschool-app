import { EntityRepository, AbstractRepository, getRepository, getManager } from 'typeorm';
import { TaskChecker, TaskInterviewResult, TaskInterviewStudent } from '../models';
import { courseService, userService } from '../services';
import { InterviewStatus, InterviewDetails, InterviewPair } from '../../../common/models/interview';

@EntityRepository(TaskChecker)
export class InterviewRepository extends AbstractRepository<TaskChecker> {
  public findByInterviewer(courseId: number, githubId: string) {
    return this.getInterviews(courseId, githubId, 'mentor');
  }

  public findByStudent(courseId: number, githubId: string): Promise<InterviewDetails[]> {
    return this.getInterviews(courseId, githubId, 'student');
  }

  public findByInterviewId(id: number): Promise<InterviewPair[]> {
    return this.getInterviewPairs(id);
  }

  public async addStudent(courseId: number, courseTaskId: number, studentId: number) {
    const repository = await getRepository(TaskInterviewStudent);
    let record = await repository.findOne({ where: { courseId, studentId, courseTaskId } });
    if (record == null) {
      record = await repository.save({ courseId, studentId, courseTaskId });
    }
    return { id: record.id };
  }

  public async cancelById(id: number) {
    await getRepository(TaskChecker).delete(id);
  }

  public async addPair(courseId: number, courseTaskId: number, interviewerGithubId: string, studentGithubId: string) {
    const [interviewer, student] = await Promise.all([
      courseService.queryMentorByGithubId(courseId, interviewerGithubId),
      courseService.queryStudentByGithubId(courseId, studentGithubId),
    ]);
    if (interviewer && student) {
      const record = {
        courseTaskId: courseTaskId,
        studentId: student.id,
        mentorId: interviewer.id,
      };
      const current = await this.repository.findOne({
        where: record,
      });
      if (!current) {
        const {
          identifiers: [{ id }],
        } = await this.repository.insert(record);
        return { id: Number(id) };
      }
      return { id: current.id };
    }
    return null;
  }

  public async findRegisteredStudent(courseId: number, courseTaskId: number, studentId: number) {
    const repository = await getRepository(TaskInterviewStudent);
    const record = await repository.findOne({ where: { courseId, studentId, courseTaskId } });
    return record ? { id: record.id } : null;
  }

  public async findRegisteredStudents(courseId: number, courseTaskId: number) {
    const repository = await getRepository(TaskInterviewStudent);
    const records = await repository
      .createQueryBuilder('is')
      .innerJoin('is.student', 'student')
      .innerJoin('student.user', 'user')
      .addSelect([
        'student.id',
        'student.totalScore',
        'student.mentorId',
        ...courseService.getPrimaryUserFields('user'),
      ])
      .where('is.courseId = :courseId', { courseId })
      .andWhere('is.courseTaskId = :courseTaskId', { courseTaskId })
      .andWhere('student.isExpelled = false')
      .orderBy('student.totalScore', 'DESC')
      .getMany();

    return records.map(record => ({
      id: record.student.id,
      name: userService.createName(record.student.user),
      githubId: record.student.user.githubId,
      mentor: record.student.mentorId ? { id: record.student.mentorId } : null,
      totalScore: record.student.totalScore,
    }));
  }

  private async getInterviews(courseId: number, githubId: string, type: 'mentor' | 'student') {
    const person =
      type === 'mentor'
        ? await courseService.queryMentorByGithubId(courseId, githubId)
        : await courseService.queryStudentByGithubId(courseId, githubId);

    if (person == null) {
      return [];
    }

    const interviews = await this.createQueryBuilder('taskChecker')
      .innerJoin('taskChecker.courseTask', 'courseTask')
      .innerJoin('courseTask.task', 'task')
      .innerJoin('taskChecker.mentor', 'mentor')
      .innerJoin('mentor.user', 'mUser')
      .innerJoin('taskChecker.student', 'student')
      .innerJoin('student.user', 'sUser')
      .addSelect([
        'courseTask.id',
        'courseTask.studentStartDate',
        'courseTask.studentEndDate',
        'mentor.id',
        'student.id',
        'task.id',
        'task.name',
        'task.descriptionUrl',
        ...courseService.getPrimaryUserFields('mUser'),
        ...courseService.getPrimaryUserFields('sUser'),
      ])
      .where(`taskChecker.${type === 'mentor' ? 'mentorId' : 'studentId'} = :id`, { id: person.id })
      .andWhere('task.type = :type', { type: 'interview' })
      .getMany();

    if (interviews.length === 0) {
      return [];
    }

    const taskResults = await getRepository(TaskInterviewResult)
      .createQueryBuilder('tir')
      .where('tir.courseTaskId IN (:...ids)', { ids: interviews.map(i => i.courseTaskId) })
      .getMany();

    const students = interviews.map(record => {
      const { courseTask } = record;
      const taskResult = taskResults.find(
        taskResult => taskResult.courseTaskId === record.courseTaskId && record.student.id === taskResult.studentId,
      );
      return {
        id: courseTask.id,
        name: courseTask.task.name,
        descriptionUrl: courseTask.task.descriptionUrl,
        startDate: courseTask.studentStartDate,
        endDate: courseTask.studentEndDate,
        completed: !!taskResult,
        status: taskResult ? InterviewStatus.Completed : InterviewStatus.NotCompleted,
        interviewer: {
          githubId: record.mentor.user.githubId,
          name: userService.createName(record.mentor.user),
        },
        student: {
          githubId: record.student.user.githubId,
          name: userService.createName(record.student.user),
        },
        result: taskResult?.score?.toString() ?? null,
      };
    });
    return students as InterviewDetails[];
  }

  private async getInterviewPairs(courseTaskId: number): Promise<InterviewPair[]> {
    const result = await getManager().query(
      `
SELECT
  tc.id,
  task_interview_result.score,
  m_user."firstName" AS "interviewerFirstName",
  m_user."lastName" AS "interviewerLastName",
  m_user."githubId" AS "interviewerGithubId",
  s_user."firstName" AS "studentFirstName",
  s_user."lastName" AS "studentLastName",
  s_user."githubId" AS "studentGithubId"
FROM task_checker AS tc
LEFT JOIN task_interview_result ON tc."studentId" = task_interview_result."studentId"
LEFT JOIN mentor AS m ON m.id = tc."mentorId"
LEFT JOIN student AS s ON s.id = tc."studentId"
LEFT JOIN "user" AS m_user ON m_user.id = m."userId"
LEFT JOIN "user" AS s_user ON s_user.id = s."userId"
WHERE tc."courseTaskId" = $1
    `,
      [courseTaskId],
    );
    return result.map((item: any) => {
      return {
        id: item.id,
        result: item.score,
        status: item.score ? InterviewStatus.Completed : InterviewStatus.NotCompleted,
        interviewer: {
          githubId: item.interviewerGithubId,
          name: userService.createName({
            firstName: item.interviewerFirstName,
            lastName: item.interviewerLastName,
          }),
        },
        student: {
          githubId: item.studentGithubId,
          name: userService.createName({
            firstName: item.studentFirstName,
            lastName: item.studentLastName,
          }),
        },
      } as InterviewPair;
    });
  }
}

export interface InterviewInfo extends InterviewPair {
  name: string;
  completed: boolean;
  interviewer: {
    name: string;
    cityName?: string;
    githubId: string;
    preference: string;
  };
  student: {
    name: string;
    totalScore: number;
    githubId: string;
    cityName?: string;
  };
}
