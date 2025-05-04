import { CourseTask } from '@entities/courseTask';
import { TaskVerification } from '@entities/taskVerification';
import { ForbiddenException, Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as dayjs from 'dayjs';
import { Repository } from 'typeorm';
import { WriteScoreService } from '../score';
import { SelfEducationAnswers } from './dto';

type CorrectAnswer = SelfEducationAnswers[number] & { isCorrect: boolean };

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

    const { score, details, studentCorrectAnswers } = this.verifySelfEducationAnswers(
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
      answers: studentCorrectAnswers,
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

    if (studentAnswers.length !== numberOfQuestions) {
      throw new BadRequestException(
        `Number of submitted answers (${studentAnswers.length}) does not match the number of questions (${numberOfQuestions})`,
      );
    }

    // Check if all answer values are integers
    if (studentAnswers.flatMap(a => (Array.isArray(a.value) ? a.value : [a.value])).some(a => !Number.isInteger(a))) {
      throw new BadRequestException('Invalid answer value');
    }

    const submittedIndices = new Set(studentAnswers.map(a => a.index));
    if (submittedIndices.size !== numberOfQuestions) {
      throw new BadRequestException('Submitted answer indices must be unique');
    }

    for (let i = 0; i < numberOfQuestions; i++) {
      if (!submittedIndices.has(i)) {
        throw new BadRequestException(`Missing answer for question index ${i}`);
      }
    }

    const { maxScore } = courseTask;

    if (
      !this.isNextSubmitAllowed(oneAttemptPerNumberOfHours, lastAttemptTime) ||
      (strictAttemptsMode && attempt >= maxAttemptsNumber)
    ) {
      throw new ForbiddenException();
    }

    const rightAnswersCount = studentAnswers
      .map(({ index, value }) => {
        const rightAnswer = this.sortAnswers(answers[index]);
        const userAnswer = this.sortAnswers(value);

        return Number(rightAnswer === userAnswer);
      })
      .reduce((sum, value) => sum + value, 0);

    const rightAnswersPercent = Math.round((100 / numberOfQuestions) * rightAnswersCount);
    let score = rightAnswersPercent < tresholdPercentage ? 0 : Math.floor(maxScore * rightAnswersPercent * 0.01);
    let details =
      rightAnswersPercent < tresholdPercentage
        ? `Your accuracy: ${rightAnswersPercent}%. The minimum accuracy for obtaining a score on this test is ${tresholdPercentage}%.`
        : `Accuracy: ${rightAnswersPercent}%`;

    if (attempt >= maxAttemptsNumber) {
      score = Math.floor(score / 2);
      details += '. Attempts number was over, so score was divided by 2';
    }

    const studentCorrectAnswers: CorrectAnswer[] = studentAnswers.map(({ index, value }) => {
      const sortedAnswers = this.sortAnswers(answers[index]);
      const sortedValues = this.sortAnswers(value);
      return { index, value, isCorrect: sortedAnswers === sortedValues };
    });

    return {
      studentCorrectAnswers,
      score,
      details,
    };
  }

  private isNextSubmitAllowed(hours: number, lastAttemptTime?: string) {
    if (!hours || !lastAttemptTime) return true;

    return dayjs().diff(lastAttemptTime, 'hours') >= hours;
  }

  private sortAnswers<T>(values: T): string {
    return String(values)
      .split(',')
      .sort((a, b) => Number(a) - Number(b))
      .join('');
  }
}
