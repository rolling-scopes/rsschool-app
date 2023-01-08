import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SelfEducationQuestionWithSelectedAnswers, TaskVerification } from '@entities/taskVerification';
import { TaskVerificationAttemptDto } from './dto/task-verifications-attempts.dto';

@Injectable()
export class TaskVerificationsService {
  constructor(
    @InjectRepository(TaskVerification)
    readonly taskVerificationRepository: Repository<TaskVerification>,
  ) {}

  public async getAnswersByAttempts(courseTaskId: number): Promise<TaskVerificationAttemptDto[]> {
    // TODO: check that deadline is passed
    const taskVerifications = await this.taskVerificationRepository.find({
      select: ['createdDate', 'courseTaskId', 'score', 'answers', 'courseTask'],
      where: { courseTaskId },
      relations: ['courseTask', 'courseTask.task'],
      order: {
        createdDate: 'desc',
      },
    });

    return taskVerifications.map(tv => {
      const questionsWithIncorrectAnswers: SelfEducationQuestionWithSelectedAnswers[] = tv.answers
        .filter(answer => !answer.isCorrect)
        .map(answer => {
          const taskQuestion = (tv.courseTask.task.attributes as any).public.questions[answer.index];

          return {
            answers: taskQuestion.answers,
            selectedAnswers: answer.value,
            multiple: taskQuestion.multiple,
            question: taskQuestion.question,
            answersType: taskQuestion.answersType,
            questionImage: taskQuestion.questionImage,
          };
        });

      return new TaskVerificationAttemptDto(tv, questionsWithIncorrectAnswers);
    });
  }
}
