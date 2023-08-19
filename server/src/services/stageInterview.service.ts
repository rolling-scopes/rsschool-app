import { StageInterview, StageInterviewFeedback } from '../models';
import { StageInterviewFeedbackJson } from '../../../common/models';

export function getInterviewRatings({ skills, programmingTask, resume }: StageInterviewFeedbackJson) {
  const commonSkills = Object.values(skills.common).filter(Boolean) as number[];
  const dataStructuresSkills = Object.values(skills.dataStructures).filter(Boolean) as number[];

  const htmlCss = skills.htmlCss.level;
  const common = commonSkills.reduce((acc, cur) => acc + cur, 0) / commonSkills.length;
  const dataStructures = dataStructuresSkills.reduce((acc, cur) => acc + cur, 0) / dataStructuresSkills.length;

  if (resume?.score !== undefined) {
    const rating = resume.score;
    return { rating, htmlCss, common, dataStructures };
  }

  const ratingsCount = 4;
  const ratings = [htmlCss, common, dataStructures, programmingTask.codeWritingLevel].filter(Boolean) as number[];
  const rating = ratings.length === ratingsCount ? ratings.reduce((sum, num) => sum + num) / ratingsCount : 0;

  return { rating, htmlCss, common, dataStructures };
}

export const getStageInterviewRating = (stageInterviews: StageInterview[]) => {
  const [lastInterview] = stageInterviews
    .filter((interview: StageInterview) => interview.isCompleted)
    .map(({ stageInterviewFeedbacks, score }: StageInterview) =>
      stageInterviewFeedbacks.map((feedback: StageInterviewFeedback) => ({
        date: feedback.updatedDate,
        // interviews in new template should have score precalculated
        rating: score ?? getInterviewRatings(JSON.parse(feedback.json)).rating,
      })),
    )
    .reduce((acc, cur) => acc.concat(cur), [])
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return lastInterview && lastInterview.rating !== undefined ? lastInterview.rating : null;
};
