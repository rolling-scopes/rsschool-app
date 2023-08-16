import { Repository } from 'typeorm';
import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { StageInterview, StageInterviewFeedback } from '@entities/index';
import { StudentsService } from '../students';
import { UpdateInterviewFeedbackDto } from './dto/update-interview-feedback.dto';

@Injectable()
export class InterviewFeedbackService {
  constructor(
    @InjectRepository(StageInterview)
    readonly stageInterviewRepository: Repository<StageInterview>,
    @InjectRepository(StageInterviewFeedback)
    readonly stageInterviewFeedbackRepository: Repository<StageInterviewFeedback>,
    readonly studentsService: StudentsService,
  ) {}

  public async getStageInterviewFeedback(interviewId: number, interviewerGithubId: string) {
    const interviewFeedback = await this.stageInterviewFeedbackRepository.findOne({
      where: {
        stageInterview: {
          mentor: {
            user: {
              githubId: interviewerGithubId,
            },
          },
          id: interviewId,
        },
      },
      relations: ['stageInterview', 'stageInterview.mentor', 'stageInterview.mentor.user'],
    });

    if (!interviewFeedback) {
      return null;
    }

    return {
      ...this.parseFeedback(interviewFeedback),
      isCompleted: interviewFeedback.stageInterview.isCompleted,
    };
  }

  public async upsertInterviewFeedback({
    interviewId,
    dto,
    interviewerId,
  }: {
    interviewId: number;
    dto: UpdateInterviewFeedbackDto;
    interviewerId: number;
  }) {
    const interview = await this.stageInterviewRepository.findOneBy({ id: interviewId });

    if (!interview || interview.mentorId !== interviewerId) {
      throw new BadRequestException('Interview is not found');
    }
    const { studentId } = interview;
    const { decision, isGoodCandidate, isCompleted, rating } = dto;

    await Promise.all([
      this.saveFeedback(interview.id, dto),
      this.stageInterviewRepository.update(interviewId, {
        isCompleted,
        decision,
        isGoodCandidate,
        rating,
      }),
      decision === 'yes' ? this.studentsService.setMentor(studentId, interviewerId) : Promise.resolve(),
    ]);
  }

  private async saveFeedback(stageInterviewId: number, data: UpdateInterviewFeedbackDto) {
    const feedback = await this.stageInterviewFeedbackRepository.findOne({ where: { stageInterviewId } });

    const newFeedback = { stageInterviewId, json: JSON.stringify(data.json), version: data.version };

    if (feedback) {
      await this.stageInterviewFeedbackRepository.update(feedback.id, newFeedback);
    } else {
      await this.stageInterviewFeedbackRepository.insert(newFeedback);
    }
  }

  private parseFeedback(feedback: StageInterviewFeedback) {
    const { json, version } = feedback;

    return {
      json: json ? JSON.parse(json) : {},
      version: version ?? 0,
    };
  }
}
