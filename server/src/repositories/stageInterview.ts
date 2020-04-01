import { EntityRepository, AbstractRepository, getRepository } from 'typeorm';
import { StageInterview, CourseTask, StageInterviewStudent } from '../models';
import { courseService, userService } from '../services';
import { InterviewInfo, InterviewDetails } from './interview';
import { createInterviews } from '../rules/interviews';
import { queryMentorByGithubId } from '../services/course.service';

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
      .orderBy('si.updatedDate', 'DESC')
      .getMany();

    const result = stageInterviews.map(it => {
      return {
        id: it.id,
        name: it.courseTask.task.name,
        startDate: it.courseTask.studentStartDate,
        endDate: it.courseTask.studentEndDate,
        completed: it.isCompleted,
        student: {
          totalScore: it.student.totalScore,
          cityName: it.student.user.cityName,
          githubId: it.student.user.githubId,
          name: userService.createName(it.student.user),
        },
        interviewer: {
          cityName: it.mentor.user.cityName,
          githubId: it.mentor.user.githubId,
          name: userService.createName(it.mentor.user),
          preference: it.mentor.studentsPreference ?? 'any',
        },
      };
    });
    return result;
  }

  public async create(courseId: number, studentGithubId: string, interviewerGithubId: string) {
    const courseTask = await getRepository(CourseTask).findOne({ where: { courseId, type: 'stage-interview' } });

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
    const interview = await getRepository(StageInterview).findOne(id);
    if (interview) {
      const mentor = await courseService.queryMentorByGithubId(interview?.courseId, githubId);
      if (mentor) {
        getRepository(StageInterview).update(id, { mentorId: mentor.id });
      }
    }
  }

  public async addStudent(courseId: number, studentId: number) {
    const repository = await getRepository(StageInterviewStudent);
    let record = await repository.findOne({ where: { courseId, studentId } });
    if (record == null) {
      record = await repository.save({ courseId, studentId });
    }
    return { id: record.id };
  }

  public async findStudent(courseId: number, studentId: number) {
    const repository = await getRepository(StageInterviewStudent);
    const record = await repository.findOne({ where: { courseId, studentId } });
    return record ? { id: record.id } : null;
  }

  public async findStudents(courseId: number) {
    const repository = await getRepository(StageInterviewStudent);
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
      .where('sis.courseId = :courseId', { courseId })
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

  public async createAutomatically(courseId: number, keepReserve = true, noRegistration: boolean = false) {
    const courseTask = await getRepository(CourseTask).findOne({ where: { courseId, type: 'stage-interview' } })!;
    if (courseTask == null) {
      return [];
    }

    const mentors = await courseService.getMentorsWithStudents(courseId);
    const students = noRegistration
      ? await courseService.getStudents(courseId, true)
      : await this.findStudents(courseId);
    const interviews = await this.findMany(courseId);
    const result = createInterviews(mentors, students, interviews, keepReserve);

    return getRepository(StageInterview).save(
      result.map(r => ({ courseTaskId: courseTask?.id, courseId, mentorId: r.mentor.id, studentId: r.student.id })),
    );
  }

  public async removeByMentor(courseId: number, githubId: string) {
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
        await getRepository(StageInterview).delete(interviews.map(i => i.id));
      }
    }
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
      .andWhere(`${userType}.isExpelled = false`)
      .getMany();

    const result = stageInterviews.map(it => {
      return {
        id: it.id,
        name: it.courseTask.task.name,
        completed: it.isCompleted,
        descriptionUrl: it.courseTask.task.descriptionUrl,
        startDate: it.courseTask.studentStartDate,
        endDate: it.courseTask.studentEndDate,
        interviewer: { githubId: it.mentor.user.githubId, name: userService.createName(it.mentor.user) },
        student: { githubId: it.student.user.githubId, name: userService.createName(it.student.user) },
      };
    });
    return result as InterviewDetails[];
  }
}
