import { CourseTask } from '@entities/courseTask';
import { TaskVerification } from '@entities/taskVerification';
import { ForbiddenException, Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as dayjs from 'dayjs';
import { Repository } from 'typeorm';
import { WriteScoreService } from '../score';
import { SelfEducationAnswers } from './dto';

type CheckedAnswer = SelfEducationAnswers[number] & { isCorrect: boolean };

type SelfEducationVerificationParams = {
  courseId: number;
  courseTask: CourseTask;
  studentId: number;
  studentAnswers: SelfEducationAnswers;
};

export type SelfEducationAttributes = {
  public: {
    maxAttemptsNumber: number;
    numberOfQuestions: number;
    tresholdPercentage: number;
    strictAttemptsMode?: boolean;
    oneAttemptPerNumberOfHours?: number;
    questions: {
      question: string;
      answers: string[];
      multiple: boolean;
    }[];
  };
  answers: (number | number[])[];
};

@Injectable()
export class SelfEducationService {
  constructor(
    @InjectRepository(TaskVerification)
    private readonly taskVerificationsRepository: Repository<TaskVerification>,

    private readonly writeScoreService: WriteScoreService,
  ) {}

  public async createSelfEducationVerification({
    courseTask,
    studentId,
    studentAnswers,
  }: SelfEducationVerificationParams) {
    const { id: courseTaskId, type: courseTaskType } = courseTask;

    const verifications = await this.taskVerificationsRepository.find({
      where: { studentId, courseTaskId },
      order: { createdDate: 'DESC' },
    });

    const { score, details, checkedAnswers } = this.verifySelfEducationAnswers(
      courseTask,
      studentAnswers,
      verifications.length,
      verifications[0]?.createdDate?.toString(),
    );

    const { id } = await this.taskVerificationsRepository.save({
      studentId,
      courseTaskId,
      score,
      details,
      status: 'completed',
      answers: checkedAnswers,
    });
    const result = await this.taskVerificationsRepository.findOneByOrFail({ id });
    await this.writeScoreService.saveScore(studentId, courseTaskId, { score, comment: details });

    return { ...result, courseTask: { type: courseTaskType } };
  }

  public verifySelfEducationAnswers(
    courseTask: CourseTask,
    studentAnswers: SelfEducationAnswers,
    attempt: number,
    lastAttemptTime?: string,
  ) {
    const {
      answers,
      public: {
        tresholdPercentage,
        maxAttemptsNumber,
        numberOfQuestions,
        strictAttemptsMode = true,
        oneAttemptPerNumberOfHours = 0,
      },
    } = courseTask.task.attributes as SelfEducationAttributes;

    if (studentAnswers.length > answers.length || studentAnswers.length === 0) {
      throw new BadRequestException(`Incorrect student answers count`);
    }

    const isPositiveInteger = (value: number) => Number.isInteger(value) && value >= 0;
    const isWithinAnswersRange = (index: number) => index >= 0 && index < answers.length;

    // Check if all answer values are integers
    if (studentAnswers.flatMap(a => (Array.isArray(a.value) ? a.value : [a.value])).some(a => !isPositiveInteger(a))) {
      throw new BadRequestException('Invalid answer value');
    }

    if (studentAnswers.some(a => !isPositiveInteger(a.index) || !isWithinAnswersRange(a.index))) {
      throw new BadRequestException('Invalid answer index');
    }

    const submittedIndices = new Set(studentAnswers.map(a => a.index));
    if (submittedIndices.size !== studentAnswers.length) {
      throw new BadRequestException('Submitted answer indices must be unique');
    }

    const { maxScore } = courseTask;

    if (
      !this.isNextSubmitAllowed(oneAttemptPerNumberOfHours, lastAttemptTime) ||
      (strictAttemptsMode && attempt >= maxAttemptsNumber)
    ) {
      throw new ForbiddenException();
    }

    const checkedAnswers: CheckedAnswer[] = studentAnswers.map(({ index, value: studentAnswer }) => {
      const answer = answers[index];
      if (answer === undefined) {
        throw new BadRequestException('Invalid answer index');
      }

      const serializedAnswer = this.serializeAnswers(answer);
      const serializedStudentAnswer = this.serializeAnswers(studentAnswer);

      return { index, value: studentAnswer, isCorrect: serializedAnswer === serializedStudentAnswer };
    });

    const correctAnswersCount = checkedAnswers.filter(answer => answer.isCorrect === true).length;
    const correctAnswersPercent = Math.round((100 / numberOfQuestions) * correctAnswersCount);

    let score = correctAnswersPercent < tresholdPercentage ? 0 : Math.floor(maxScore * correctAnswersPercent * 0.01);
    let details =
      correctAnswersPercent < tresholdPercentage
        ? `Your accuracy: ${correctAnswersPercent}%. The minimum accuracy for obtaining a score on this test is ${tresholdPercentage}%.`
        : `Accuracy: ${correctAnswersPercent}%`;

    if (attempt >= maxAttemptsNumber) {
      score = Math.floor(score / 2);
      details += '. Attempts number was over, so score was divided by 2';
    }

    return {
      checkedAnswers,
      score,
      details,
    };
  }

  private isNextSubmitAllowed(hours: number, lastAttemptTime?: string) {
    if (!hours || !lastAttemptTime) return true;

    return dayjs().diff(lastAttemptTime, 'hours') >= hours;
  }

  /**
   * Sorts the values and joins them with a pipe character.
   * The final string is used for comparison of answers.
   */
  private serializeAnswers(values: number | number[]): string {
    if (Array.isArray(values)) {
      return [...values].sort((a, b) => Number(a) - Number(b)).join('|');
    }
    return String(values);
  }
}
