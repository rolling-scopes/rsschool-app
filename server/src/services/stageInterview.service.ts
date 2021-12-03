import { StageInterview, StageInterviewFeedback, StageInterviewStudent, Student } from '../models';
import { getRepository } from 'typeorm';
import { StageInterviewFeedbackJson } from '../../../common/models';
import * as courseService from './course.service';

export async function getAvailableStudents(courseId: number) {
  const students = await getRepository(Student)
    .createQueryBuilder('student')
    .innerJoin(StageInterviewStudent, 'sis', 'sis.studentId = student.id')
    .innerJoin('student.user', 'user')
    .leftJoin('student.stageInterviews', 'si')
    .leftJoin('si.stageInterviewFeedbacks', 'sif')
    .addSelect([
      ...courseService.getPrimaryUserFields('user'),
      'si.id',
      'si.isGoodCandidate',
      'si.isCompleted',
      'sif.json',
      'sif.updatedDate',
    ])
    .where(
      [
        `student.courseId = :courseId`,
        `student.isFailed = false`,
        `student.isExpelled = false`,
        `student.totalScore > 0`,
        `student.mentorId IS NULL`,
      ].join(' AND '),
      { courseId },
    )
    .orderBy('student.totalScore', 'DESC')
    .getMany();

  const result = students
    .filter(s => {
      return (
        !s.stageInterviews ||
        s.stageInterviews.length === 0 ||
        s.stageInterviews.every(i => i.isCompleted || i.isCanceled)
      );
    })
    .map(student => {
      const { id, user, totalScore } = student;
      const stageInterviews: StageInterview[] = student.stageInterviews || [];
      return {
        id,
        totalScore,
        githubId: user.githubId,
        name: `${user.firstName} ${user.lastName}`.trim(),
        cityName: user.cityName,
        isGoodCandidate: isGoodCandidate(stageInterviews),
        rating: getStageInterviewRating(stageInterviews),
      };
    });
  return result;
}

export function getInterviewRatings({ skills, programmingTask, resume }: StageInterviewFeedbackJson) {
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

const isGoodCandidate = (stageInterviews: StageInterview[]) =>
  stageInterviews.some(i => i.isCompleted && i.isGoodCandidate);

export const getStageInterviewRating = (stageInterviews: StageInterview[]) => {
  const [lastInterview] = stageInterviews
    .filter((interview: StageInterview) => interview.isCompleted)
    .map(({ stageInterviewFeedbacks }: StageInterview) =>
      stageInterviewFeedbacks.map((feedback: StageInterviewFeedback) => ({
        date: feedback.updatedDate,
        rating: getInterviewRatings(JSON.parse(feedback.json)).rating,
      })),
    )
    .reduce((acc, cur) => acc.concat(cur), [])
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return lastInterview && lastInterview.rating !== undefined ? lastInterview.rating : null;
};
