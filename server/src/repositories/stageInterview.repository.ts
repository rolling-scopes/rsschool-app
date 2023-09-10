import { EntityRepository, AbstractRepository, getRepository } from 'typeorm';
import { InterviewStatus, InterviewDetails } from '../../../common/models/interview';
import { StageInterview, CourseTask, StageInterviewStudent } from '../models';
import { courseService, userService } from '../services';
import { InterviewInfo } from './interview.repository';
import { createInterviews } from '../rules/interviews';
import { queryMentorByGithubId, queryStudentByGithubId } from '../services/course.service';
import { TaskType } from '../models/task';

@EntityRepository(StageInterview)
export class StageInterviewRepository extends AbstractRepository<StageInterview> {
  public findByInterviewer(courseId: number, githubId: string) {
    return this.find(courseId, githubId, 'mentor');
  }

  public findByStudent(courseId: number, githubId: string) {
    return this.find(courseId, githubId, 'student');
  }

  public async findMany(courseId: number): Promise<InterviewInfo[]> {
    const stageInterviews = await this.createQueryBuilder('si')
      .innerJoin('si.courseTask', 'courseTask')
      .innerJoin('courseTask.task', 'task')
      .innerJoin('si.mentor', 'mentor')
      .innerJoin('si.student', 'student')
      .innerJoin('mentor.user', 'mUser')
      .innerJoin('student.user', 'sUser')
      .addSelect([
        'courseTask.id',
        'courseTask.studentStartDate',
        'courseTask.studentEndDate',
        'task.id',
        'task.name',
        'mentor.id',
        'mentor.studentsPreference',
        'student.id',
        'student.totalScore',
        ...courseService.getPrimaryUserFields('mUser'),
        ...courseService.getPrimaryUserFields('sUser'),
      ])
      .where('si.courseId = :courseId', { courseId })
      .andWhere(`si.isCanceled <> :canceled`, { canceled: true })
      .orderBy('si.updatedDate', 'DESC')
      .getMany();

    const result = stageInterviews.map(it => {
      return {
        id: it.id,
        name: it.courseTask.task.name,
        startDate: it.courseTask.studentStartDate,
        endDate: it.courseTask.studentEndDate,
        completed: it.isCompleted,
        result: null,
        status: it.isCompleted
          ? InterviewStatus.Completed
          : it.isCanceled
          ? InterviewStatus.Canceled
          : InterviewStatus.NotCompleted,
        student: {
          id: it.student.id,
          totalScore: it.student.totalScore,
          cityName: it.student.user.cityName ?? undefined,
          countryName: it.student.user.countryName ?? undefined,
          githubId: it.student.user.githubId,
          name: userService.createName(it.student.user),
        },
        interviewer: {
          id: it.mentor.id,
          cityName: it.mentor.user.cityName ?? undefined,
          countryName: it.mentor.user.countryName ?? undefined,
          githubId: it.mentor.user.githubId,
          name: userService.createName(it.mentor.user),
          preference: it.mentor.studentsPreference ?? 'any',
        },
      };
    });
    return result;
  }

  public async create(courseId: number, studentGithubId: string, interviewerGithubId: string) {
    const courseTask = await getRepository(CourseTask).findOne({
      where: { courseId, type: TaskType.StageInterview, disabled: false },
    });

    const [student, interviewer] = await Promise.all([
      courseService.queryStudentByGithubId(courseId, studentGithubId),
      courseService.queryMentorByGithubId(courseId, interviewerGithubId),
    ]);

    if (courseTask == null || student == null || interviewer == null) {
      return null;
    }

    const interview = await getRepository(StageInterview).save({
      courseId,
      mentorId: interviewer.id,
      studentId: student.id,
      courseTaskId: courseTask.id,
    });

    return interview;
  }

  public async updateInterviewer(id: number, githubId: string) {
    const interview = await getRepository(StageInterview).findOneBy({ id });
    if (interview) {
      const mentor = await courseService.queryMentorByGithubId(interview?.courseId, githubId);
      if (mentor) {
        getRepository(StageInterview).update(id, { mentorId: mentor.id });
      }
    }
  }

  public async addStudent(courseId: number, studentId: number) {
    const repository = getRepository(StageInterviewStudent);
    let record = await repository.findOne({ where: { courseId, studentId } });
    if (record == null) {
      record = await repository.save({ courseId, studentId });
    }
    return { id: record.id };
  }

  public async findStudent(courseId: number, studentId: number) {
    const repository = getRepository(StageInterviewStudent);
    const record = await repository.findOne({ where: { courseId, studentId } });
    return record ? { id: record.id } : null;
  }

  public async findStudents(courseId: number) {
    const repository = getRepository(StageInterviewStudent);
    const records = await repository
      .createQueryBuilder('sis')
      .innerJoin('sis.student', 'student')
      .innerJoin('student.user', 'user')
      .addSelect([
        'student.id',
        'student.totalScore',
        'student.mentorId',
        ...courseService.getPrimaryUserFields('user'),
      ])
      .where('sis.courseId = :courseId AND student.isExpelled = false AND student.mentorId IS NULL', { courseId })
      .getMany();

    return records.map(record => ({
      id: record.student.id,
      name: userService.createName(record.student.user),
      githubId: record.student.user.githubId,
      cityName: record.student.user.cityName ?? 'Other',
      countryName: record.student.user.countryName ?? 'Other',
      mentor: record.student.mentorId ? { id: record.student.mentorId } : null,
      totalScore: record.student.totalScore,
    }));
  }

  public async createAutomatically(courseId: number, noRegistration: boolean = false) {
    const courseTasks = await getRepository(CourseTask).find({
      where: { courseId, type: TaskType.StageInterview, disabled: false },
    });
    if (courseTasks.length === 0) {
      return [];
    }
    if (courseTasks.length > 1) {
      throw new Error('More than one stage interview task');
    }
    const [courseTask] = courseTasks;
    const mentors = await courseService.getMentorsWithStudents(courseId);

    const students = noRegistration
      ? await courseService.getStudents(courseId, true)
      : await this.findStudents(courseId);
    const interviews = await this.findMany(courseId);

    const distibution = createInterviews(mentors, students, interviews);

    const result = await getRepository(StageInterview).save(
      distibution.map(pair => ({
        courseTaskId: courseTask?.id,
        courseId,
        mentorId: pair.mentor.id,
        studentId: pair.student.id,
      })),
    );

    return result;
  }

  public async cancelByMentor(courseId: number, githubId: string) {
    const mentor = await queryMentorByGithubId(courseId, githubId);
    if (mentor) {
      const interviews = await getRepository(StageInterview)
        .createQueryBuilder('s')
        .select(['s.id'])
        .leftJoin('s.stageInterviewFeedbacks', 'f')
        .addSelect(['f.id'])
        .where('f.id IS NULL')
        .andWhere('s.mentorId = :mentorId', { mentorId: mentor.id })
        .getMany();
      if (interviews.length > 0) {
        await getRepository(StageInterview).update(
          interviews.map(i => i.id),
          { isCanceled: true },
        );
      }
    }
  }

  public async cancelByStudent(courseId: number, githubId: string) {
    const student = await queryStudentByGithubId(courseId, githubId);
    if (student == null) {
      return;
    }
    await getRepository(StageInterview).update(
      {
        studentId: student.id,
        isCompleted: false,
      },
      { isCanceled: true },
    );
  }

  private async find(courseId: number, githubId: string, userType: 'student' | 'mentor') {
    const userKey = userType === 'student' ? 'sUser' : 'mUser';

    const stageInterviews = await getRepository(StageInterview)
      .createQueryBuilder('stageInterview')
      .innerJoin('stageInterview.courseTask', 'courseTask')
      .innerJoin('courseTask.task', 'task')
      .innerJoin('stageInterview.mentor', 'mentor')
      .innerJoin('stageInterview.student', 'student')
      .innerJoin('mentor.user', 'mUser')
      .innerJoin('student.user', 'sUser')
      .addSelect([
        'courseTask.id',
        'task.id',
        'task.name',
        'task.descriptionUrl',
        'courseTask.studentStartDate',
        'courseTask.studentEndDate',
        'student.id',
        'mentor.id',
        ...courseService.getPrimaryUserFields('mUser'),
        ...courseService.getPrimaryUserFields('sUser'),
      ])
      .where(`stageInterview.courseId = :courseId AND ${userKey}.githubId = :githubId`, { courseId, githubId })
      .andWhere(`stageInterview.isCanceled <> :canceled`, { canceled: true })
      .andWhere(`${userType === 'student' ? 'mentor' : 'student'}.isExpelled = false`)
      .getMany();

    const result = stageInterviews.map(it => {
      return {
        id: it.id,
        name: it.courseTask.task.name,
        completed: it.isCompleted,
        status: it.isCompleted
          ? InterviewStatus.Completed
          : it.isCanceled
          ? InterviewStatus.Canceled
          : InterviewStatus.NotCompleted,
        descriptionUrl: it.courseTask.task.descriptionUrl,
        startDate: it.courseTask.studentStartDate,
        endDate: it.courseTask.studentEndDate,
        result: it.decision ?? null,
        interviewer: { githubId: it.mentor.user.githubId, name: userService.createName(it.mentor.user) },
        decision: it.decision,
        student: {
          id: it.student.id,
          githubId: it.student.user.githubId,
          name: userService.createName(it.student.user),
        },
      };
    });
    return result as InterviewDetails[];
  }
}
