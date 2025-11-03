import { CoreJsInterviewFeedback, StudentStats } from '@common/models';

export const getStudentCoreJSInterviews = (stats?: StudentStats[]) => {
  if (!stats || stats.length === 0) return;
  return stats
    .filter((student: StudentStats) => student.tasks.some(({ interviewFormAnswers }) => interviewFormAnswers))
    .map(({ tasks, courseFullName, courseName, locationName }) => ({
      courseFullName,
      courseName,
      locationName,
      interviews: tasks
        .filter(({ interviewFormAnswers }) => interviewFormAnswers)
        .map(({ interviewFormAnswers, score, comment, interviewer, name, interviewDate }) => ({
          score,
          comment,
          interviewer,
          answers: interviewFormAnswers,
          name,
          interviewDate,
        })),
    })) as CoreJsInterviewFeedback[];
};

export const checkIsProfileOwner = (githubId: string, requestedGithubId: string): boolean => {
  return githubId === requestedGithubId;
};
