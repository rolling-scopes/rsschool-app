import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Cron } from '@nestjs/schedule';
import { Repository } from 'typeorm';
import { keyBy, mapValues, round, sum, values, groupBy, first, orderBy } from 'lodash';
import { Course } from '@entities/course';
import { Student } from '@entities/student';
import { CourseTask } from '@entities/courseTask';
import { exportStageInterviewRating } from '../courses/score/export-helpers';

const ONCE_A_DAY_AT_01_00 = '0 1 * * *';
const UPDATE_CHUNK_SIZE = 500;
const UPDATE_CHUNK_DELAY_MS = 10_000;

type TaskScore = { courseTaskId: number; score: number };

type ScoreRecord = {
  id: number;
  rank: number;
  changed: boolean;
  crossCheckScore: number;
  totalScore: number;
  totalScoreChangeDate: Date;
};

// Ported 1:1 from the legacy Koa ScoreService.recalculateTotalScore cron.
@Injectable()
export class ScoreRecalculationService {
  private readonly logger = new Logger('ScoreRecalculation');

  constructor(
    @InjectRepository(Course)
    private readonly courseRepository: Repository<Course>,
    @InjectRepository(Student)
    private readonly studentRepository: Repository<Student>,
    @InjectRepository(CourseTask)
    private readonly courseTaskRepository: Repository<CourseTask>,
  ) {}

  @Cron(ONCE_A_DAY_AT_01_00, { timeZone: 'UTC' })
  async handleCron() {
    this.logger.log('Starting score update job');
    await this.recalculateTotalScore();
  }

  public async recalculateTotalScore(coursesToUpdate?: Course[]) {
    const courses = coursesToUpdate ?? (await this.getCourses());

    for (const course of courses) {
      const start = Date.now();
      this.logger.log({ msg: 'Updating course score', course: course.name });

      const courseId = course.id;
      const [students, courseTasks] = await Promise.all([
        this.getStudentsTaskScores(courseId),
        this.getCourseTasks(courseId),
      ]);

      const weightMap = mapValues(keyBy(courseTasks, 'id'), 'scoreWeight');
      const crossCheckTaskIds = courseTasks.filter(({ checker }) => checker === 'crossCheck').map(({ id }) => id);
      const calculateScore = (t: TaskScore) => t.score * (weightMap[t.courseTaskId] ?? 1);

      const sortedScores = students
        .map<ScoreRecord>(({ id, rank, taskResults, totalScore, crossCheckScore, totalScoreChangeDate }) => {
          const score = sum(taskResults.map(calculateScore));
          const newCrossCheckScore = round(
            sum(taskResults.filter(t => crossCheckTaskIds.includes(t.courseTaskId)).map(calculateScore)),
            1,
          );
          const newTotalScore = round(score, 1);
          const scoreChanged = totalScore !== newTotalScore || crossCheckScore !== newCrossCheckScore;
          return {
            id,
            rank,
            changed: scoreChanged,
            crossCheckScore: newCrossCheckScore,
            totalScore: newTotalScore,
            totalScoreChangeDate: scoreChanged ? new Date() : totalScoreChangeDate,
          };
        })
        .sort((a, b) => b.totalScore - a.totalScore);

      const result: ScoreRecord[] = [];
      sortedScores.forEach((it, index) => {
        const prev = result[index - 1];
        const rank = prev?.totalScore === it.totalScore ? prev.rank : index + 1;
        result.push({ ...it, rank, changed: it.changed || it.rank != rank });
      });

      const scores = result.filter(it => it.changed).map(({ changed, ...value }) => value);

      await this.updateScoreStudents(scores);

      this.logger.log({
        msg: 'Updated course score',
        course: course.name,
        itemsCounts: scores.length,
        duration: Date.now() - start,
      });
    }
  }

  private getCourses() {
    return this.courseRepository.find({ where: { completed: false } });
  }

  private getCourseTasks(courseId: number) {
    return this.courseTaskRepository
      .createQueryBuilder('courseTask')
      .innerJoinAndSelect('courseTask.task', 'task')
      .where('courseTask.courseId = :courseId', { courseId })
      .andWhere('courseTask.disabled = :disabled', { disabled: false })
      .getMany();
  }

  // Loads each student's effective task scores (mirrors the legacy getStudentsScore taskResults assembly):
  // non-disabled task results + latest interview result per task + stage-interview pre-screening score.
  private async getStudentsTaskScores(courseId: number) {
    const students = await this.studentRepository
      .createQueryBuilder('student')
      .leftJoin('student.taskResults', 'tr')
      .addSelect(['tr.id', 'tr.score', 'tr.courseTaskId', 'tr.studentId', 'tr.courseTask'])
      .leftJoin('tr.courseTask', 'ct')
      .addSelect(['ct.disabled', 'ct.id'])
      .leftJoin('student.taskInterviewResults', 'tir')
      .addSelect(['tir.id', 'tir.score', 'tir.courseTaskId', 'tir.updatedDate'])
      .leftJoin('student.stageInterviews', 'si')
      .leftJoin('si.stageInterviewFeedbacks', 'sif')
      .addSelect([
        'sif.stageInterviewId',
        'sif.json',
        'sif.updatedDate',
        'si.isCompleted',
        'si.id',
        'si.courseTaskId',
        'si.score',
      ])
      .where('student."courseId" = :courseId', { courseId })
      .getMany();

    return students.map(student => {
      const preScreeningScore = Math.floor(exportStageInterviewRating(student.stageInterviews ?? []) ?? 0);
      const preScreeningInterviews = student.stageInterviews?.length
        ? [{ score: preScreeningScore, courseTaskId: student.stageInterviews[0]!.courseTaskId }]
        : [];

      const interviews = values(groupBy(student.taskInterviewResults ?? [], 'courseTaskId'))
        .map(arr => first(orderBy(arr, 'updatedDate', 'desc'))!)
        .map(({ courseTaskId, score = 0 }) => ({ courseTaskId, score }));

      let taskResults: TaskScore[] =
        student.taskResults
          ?.filter(({ courseTask: { disabled } }) => !disabled)
          .map(({ courseTaskId, score }) => ({ courseTaskId, score }))
          .concat(interviews) ?? [];

      // technical screening score may already be set as a task result
      taskResults = taskResults.concat(
        preScreeningInterviews.filter(i => !taskResults.find(tr => tr.courseTaskId === i.courseTaskId)),
      );

      return {
        id: student.id,
        rank: student.rank,
        totalScore: student.totalScore,
        crossCheckScore: student.crossCheckScore,
        totalScoreChangeDate: student.totalScoreChangeDate,
        taskResults,
      };
    });
  }

  private async updateScoreStudents(
    data: Pick<ScoreRecord, 'id' | 'rank' | 'totalScore' | 'crossCheckScore' | 'totalScoreChangeDate'>[],
  ) {
    for (let i = 0; i < data.length; i += UPDATE_CHUNK_SIZE) {
      const chunk = data.slice(i, i + UPDATE_CHUNK_SIZE);
      await this.studentRepository.save(chunk);
      if (i + UPDATE_CHUNK_SIZE < data.length) {
        await this.sleep(UPDATE_CHUNK_DELAY_MS);
      }
    }
  }

  private sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
