import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TaskVerification } from '@entities/taskVerification';
import { CourseTask } from '@entities/courseTask';
import { TaskVerificationAttemptDto } from './dto/task-verifications-attempts.dto';
import { SelfEducationQuestionSelectedAnswersDto } from './dto/self-education.dto';
import * as dayjs from 'dayjs';

@Injectable()
export class TaskVerificationsService {
  constructor(
    @InjectRepository(TaskVerification)
    readonly taskVerificationRepository: Repository<TaskVerification>,

    @InjectRepository(CourseTask)
    readonly courseTaskRepository: Repository<CourseTask>,
  ) {}

  public async getAnswersByAttempts(courseTaskId: number, studentId: number): Promise<TaskVerificationAttemptDto[]> {
    const courseTask = await this.courseTaskRepository.findOneOrFail({
      where: { id: courseTaskId },
    });

    const now = dayjs();
    const endDate = dayjs(courseTask?.studentEndDate);

    if (now.isBefore(endDate)) {
      throw new BadRequestException('The answers cannot be checked until the deadline has passed.');
    }

    const taskVerifications = await this.taskVerificationRepository.find({
      select: ['createdDate', 'courseTaskId', 'score', 'answers', 'courseTask'],
      where: { courseTaskId, studentId },
      relations: ['courseTask', 'courseTask.task'],
      order: {
        createdDate: 'desc',
      },
    });

    if (taskVerifications && taskVerifications.length > 0) {
      const hasAnswers = taskVerifications.some(v => v.answers && v.answers.length > 0);

      if (!hasAnswers) {
        throw new BadRequestException('The answers are not available for this task.');
      }

      return taskVerifications.map(verification => {
        const questionsWithIncorrectAnswers: SelfEducationQuestionSelectedAnswersDto[] = verification.answers
          .filter(answer => !answer.isCorrect)
          .map(answer => {
            const taskQuestion = (verification.courseTask.task.attributes as any).public.questions[answer.index];

            return new SelfEducationQuestionSelectedAnswersDto({
              answers: taskQuestion.answers,
              selectedAnswers: answer.value,
              multiple: taskQuestion.multiple,
              question: taskQuestion.question,
              answersType: taskQuestion.answersType,
              questionImage: taskQuestion.questionImage,
            });
          });

        return new TaskVerificationAttemptDto(verification, questionsWithIncorrectAnswers);
      });
    } else {
      throw new BadRequestException('The answers cannot be checked if there were no attempts.');
    }
  }
}
