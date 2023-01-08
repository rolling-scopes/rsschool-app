import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TaskVerification } from '@entities/taskVerification';
import { TaskVerificationAttemptDto } from './dto/task-verifications-attempts.dto';

@Injectable()
export class TaskVerificationsService {
  constructor(
    @InjectRepository(TaskVerification)
    readonly taskVerificationRepository: Repository<TaskVerification>,
  ) {}

  public async getAnswers(courseTaskId: number): Promise<TaskVerificationAttemptDto[]> {
    // TODO: check that deadline is passed
    const f = this.taskVerificationRepository.find({
      where: { courseTaskId },
      relations: ['courseTask', 'task'],
    });

    console.log(f);
    return [];
  }
}
