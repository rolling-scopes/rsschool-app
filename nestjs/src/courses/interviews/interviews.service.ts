import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { StageInterviewFeedbackJson } from '@common/models';

import { CourseTask } from '@entities/courseTask';
import { StageInterview } from '@entities/stageInterview';

@Injectable()
export class InterviewsService {
  constructor(
    @InjectRepository(CourseTask)
    readonly courseTaskRepository: Repository<CourseTask>,
  ) {}

  public getAll(courseId: number) {
    return this.courseTaskRepository.find({
      where: { courseId, type: 'interview' },
      relations: ['task'],
    });
  }

  public static getStageInterviewRating = (stageInterviews: StageInterview[]) => {
    const [lastInterview] = stageInterviews
      .filter(interview => interview.isCompleted)
      .map(({ stageInterviewFeedbacks }) =>
        stageInterviewFeedbacks.map(feedback => ({
          date: feedback.updatedDate,
          rating: InterviewsService.getInterviewRatings(JSON.parse(feedback.json)).rating,
        })),
      )
      .reduce((acc, cur) => acc.concat(cur), [])
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return lastInterview && lastInterview.rating !== undefined ? lastInterview.rating : null;
  };

  public static getInterviewRatings({ skills, programmingTask, resume }: StageInterviewFeedbackJson) {
    const commonSkills = Object.values(skills.common).filter(Boolean) as number[];
    const dataStructuresSkills = Object.values(skills.dataStructures).filter(Boolean) as number[];

    const htmlCss = skills.htmlCss.level;
    const common = commonSkills.reduce((acc, cur) => acc + cur, 0) / commonSkills.length;
    const dataStructures = dataStructuresSkills.reduce((acc, cur) => acc + cur, 0) / dataStructuresSkills.length;

    if (resume?.score !== undefined) {
      const rating = resume.score / 10;
      return { rating, htmlCss, common, dataStructures };
    }

    const ratingsCount = 4;
    const ratings = [htmlCss, common, dataStructures, programmingTask.codeWritingLevel].filter(Boolean) as number[];
    const rating = ratings.length === ratingsCount ? ratings.reduce((sum, num) => sum + num) / ratingsCount : 0;

    return { rating, htmlCss, common, dataStructures };
  }
}
