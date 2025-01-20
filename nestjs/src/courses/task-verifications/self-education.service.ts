import { CourseTask } from '@entities/courseTask';
import { TaskVerification } from '@entities/taskVerification';
import { ForbiddenException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import dayjs from 'dayjs';
import { Repository } from 'typeorm';
import { WriteScoreService } from '../score';

type CorrectAnswer = {
  index: number;
  value: (number | number[])[];
  isCorrect: boolean;
};

type SelfEducationVerificationParams = {
  courseId: number;
  courseTask: CourseTask;
  studentId: number;
  studentAnswers: {
    index: number;
    value: (number | number[])[];
  }[];
};

type SelfEducationAttributes = {
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

  public async createSelfeducationVerification({
    courseTask,
    studentId,
    studentAnswers,
  }: SelfEducationVerificationParams) {
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

    const { id: courseTaskId, type: courseTaskType, maxScore } = courseTask;

    const verifications = await this.taskVerificationsRepository.find({
      where: { studentId, courseTaskId },
      order: { createdDate: 'DESC' },
    });

    const verificationsNumber = verifications.length;
    const lastVerificationDate = verifications[0]?.createdDate?.toString();

    if (
      !this.isNextSubmitAllowed(oneAttemptPerNumberOfHours, lastVerificationDate) ||
      (strictAttemptsMode && verificationsNumber >= maxAttemptsNumber)
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

    if (verificationsNumber >= maxAttemptsNumber) {
      score = Math.floor(score / 2);
      details += '. Attempts number was over, so score was divided by 2';
    }

    const studentCorrectAnswers: CorrectAnswer[] = studentAnswers.map(({ index, value }) => {
      const sortedAnswers = this.sortAnswers(answers[index]);
      const sortedValues = this.sortAnswers(value);
      return { index, value, isCorrect: sortedAnswers === sortedValues };
    });

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
