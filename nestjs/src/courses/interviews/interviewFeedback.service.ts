import { Repository } from 'typeorm';
import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { StageInterview, StageInterviewFeedback } from '@entities/index';
import { StudentsService } from '../students';
import { PutInterviewFeedbackDto } from './dto/put-interview-feedback.dto';
import { InterviewCommentDto } from './dto/interview-comment.dto';

interface InterviewDecisionCommentFeedback {
  steps: {
    decision: {
      values?: {
        comment?: string;
      };
    };
  };
}

@Injectable()
export class InterviewFeedbackService {
  constructor(
    @InjectRepository(StageInterview)
    readonly stageInterviewRepository: Repository<StageInterview>,
    @InjectRepository(StageInterviewFeedback)
    readonly stageInterviewFeedbackRepository: Repository<StageInterviewFeedback>,
    readonly studentsService: StudentsService,
  ) {}

  public async getCourseStageInterviewsComment(courseId: number, studentId: number) {
    const records = await this.stageInterviewFeedbackRepository
      .createQueryBuilder('sif')
      .leftJoinAndSelect('sif.stageInterview', 'si')
      .where('si.courseId = :courseId', { courseId })
      .andWhere('si.studentId = :studentId', { studentId })
      .select(['si.id', 'sif.json'])
      .getRawMany();

    const iterviewComments = records.map<InterviewCommentDto>(interviewFeedback => {
      const feedback = JSON.parse(interviewFeedback.sif_json) as InterviewDecisionCommentFeedback;
      const commentToStudent = feedback.steps.decision.values?.comment ?? null;

      return {
        id: Number(interviewFeedback.si_id),
        commentToStudent,
      };
    });

    return iterviewComments;
  }

  public async getStageInterviewFeedback(interviewId: number, interviewerGithubId: string) {
    const interview = await this.stageInterviewRepository.findOne({
      where: {
        id: interviewId,
        mentor: {
          user: {
            githubId: interviewerGithubId,
          },
        },
      },
      relations: ['stageInterviewFeedbacks', 'mentor', 'mentor.user', 'courseTask'],
    });

    if (!interview) {
      throw new NotFoundException(`Interview not found ${interviewId}`);
    }

    const { courseTask, stageInterviewFeedbacks } = interview;
    const feedback = stageInterviewFeedbacks.pop();

    return {
      feedback: feedback ? this.parseFeedback(feedback) : null,
      isCompleted: interview.isCompleted,
      maxScore: courseTask.maxScore,
    };
  }

  public async upsertInterviewFeedback({
    interviewId,
    dto,
    interviewerId,
  }: {
    interviewId: number;
    dto: PutInterviewFeedbackDto;
    interviewerId: number;
  }) {
    const interview = await this.stageInterviewRepository.findOneBy({ id: interviewId, mentorId: interviewerId });

    if (!interview) {
      throw new ForbiddenException();
    }

    const { studentId } = interview;
    const { decision, isGoodCandidate, isCompleted, score } = dto;

    await Promise.all([
      this.saveFeedback(interview.id, dto),
      this.stageInterviewRepository.update(interviewId, {
        isCompleted,
        decision,
        isGoodCandidate,
        score,
      }),
      decision === 'yes' ? this.studentsService.setMentor(studentId, interviewerId) : Promise.resolve(),
    ]);
  }

  private async saveFeedback(stageInterviewId: number, data: PutInterviewFeedbackDto) {
    const feedback = await this.stageInterviewFeedbackRepository.findOne({ where: { stageInterviewId } });

    const newFeedback = { stageInterviewId, json: JSON.stringify(data.json), version: data.version };

    if (feedback) {
      await this.stageInterviewFeedbackRepository.update(feedback.id, newFeedback);
    } else {
      await this.stageInterviewFeedbackRepository.insert(newFeedback);
    }
  }

  /**
   * `json` stores the feedback in the form, which depends on the version.
   */
  private parseFeedback(feedback: StageInterviewFeedback) {
    const { json, version } = feedback;

    return {
      json: json ? (JSON.parse(json) as Record<string, unknown>) : {},
      version: version ?? 0,
    };
  }
}
