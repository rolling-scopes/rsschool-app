import { StudentStats } from "common/models";
import { CoreJsInterviewsData } from "components/Profile/CoreJsIviewsCard";

export const hadStudentCoreJSInterview = (stats: StudentStats[]) =>
stats.some((student: StudentStats) => student.tasks.some(({ interviewFormAnswers }) => interviewFormAnswers));

export const getStudentCoreJSInterviews = (stats: StudentStats[]) =>
stats
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
  })) as CoreJsInterviewsData[];

export const checkIsProfileOwner = (githubId: string, requestedGithubId: string): boolean => {
return githubId === requestedGithubId;
};