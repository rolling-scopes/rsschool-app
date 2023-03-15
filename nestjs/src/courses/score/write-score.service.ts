import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TaskResult } from '@entities/taskResult';

type SaveScoreInput = {
  authorId?: number;
  score: number;
  comment: string;
  githubPrUrl?: string;
};

@Injectable()
export class WriteScoreService {
  constructor(
    @InjectRepository(TaskResult)
    readonly taskResultRepository: Repository<TaskResult>,
  ) {}

  public async saveScore(
    studentId: number,
    courseTaskId: number,
    data: SaveScoreInput,
  ): Promise<TaskResult | undefined> {
    const { authorId = 0, githubPrUrl = null } = data;

    const comment = this.trimComment(data.comment ?? '');
    const score = Math.round(data.score);

    const current = await this.taskResultRepository.findOne({
      where: { studentId, courseTaskId },
    });

    if (current == null) {
      await this.taskResultRepository.save({
        courseTaskId,
        studentId,
        score: data.score,
        comment: data.comment,
        historicalScores: [this.createHistoricalRecord(data)],
        lastCheckerId: authorId > 0 ? authorId : undefined,
        githubPrUrl: data.githubPrUrl,
      });
      return;
    }

    // if nothing changed, do nothing
    if (current.githubRepoUrl === githubPrUrl && current.comment === comment && current.score === score) {
      return;
    }

    let previousScore: TaskResult | undefined;
    if (current.comment !== comment || current.score !== score) {
      previousScore = { ...current };
      current.historicalScores.push(this.createHistoricalRecord(data));
    }

    if (githubPrUrl) {
      current.githubPrUrl = githubPrUrl;
    }

    if (comment) {
      current.comment = comment;
    }

    if (score !== current.score) {
      if (authorId > 0) {
        current.lastCheckerId = authorId;
      }
      current.score = score;
    }

    await this.taskResultRepository.update(current.id, {
      score: current.score,
      comment: current.comment,
      githubPrUrl: current.githubPrUrl,
      historicalScores: current.historicalScores,
      lastCheckerId: current.lastCheckerId,
    });
    return previousScore;
  }

  private createHistoricalRecord(data: Pick<SaveScoreInput, 'authorId' | 'comment' | 'score'>) {
    return {
      authorId: data.authorId ?? 0,
      score: data.score,
      dateTime: Date.now(),
      comment: data.comment,
    };
  }

  private trimComment(comment: string): string {
    return comment.substring(0, 8 * 1024);
  }
}
