import { EntityRepository, AbstractRepository, getRepository } from 'typeorm';
import { TaskChecker, TaskInterviewResult } from '../models';
import { courseService, userService } from '../services';

@EntityRepository(TaskChecker)
export class InterviewRepository extends AbstractRepository<TaskChecker> {
  public findByInterviewer(courseId: number, githubId: string) {
    return this.getInterviews(courseId, githubId, 'mentor');
  }

  public findByStudent(courseId: number, githubId: string): Promise<InterviewDetails[]> {
    return this.getInterviews(courseId, githubId, 'student');
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
      return {
        id: courseTask.id,
        name: courseTask.task.name,
        descriptionUrl: courseTask.task.descriptionUrl,
        startDate: courseTask.studentStartDate,
        endDate: courseTask.studentEndDate,
        completed: taskResults.some(taskResult => taskResult.courseTaskId === record.courseTaskId),
        interviewer: {
          githubId: record.mentor.user.githubId,
          name: userService.createName(record.mentor.user),
        },
        student: {
          githubId: record.student.user.githubId,
          name: userService.createName(record.student.user),
        },
      };
    });
    return students as InterviewDetails[];
  }
}

export interface InterviewDetails {
  id: number;
  name: string;
  completed: boolean;
  descriptionUrl: string;
  startDate: string;
  endDate: string;
  interviewer: { name: string; githubId: string };
  student: { name: string; githubId: string };
}

export interface InterviewInfo {
  id: number;
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
