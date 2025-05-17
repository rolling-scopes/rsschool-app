import {
  CoursesInterviewsApi,
  CoursesTasksApi,
  CourseStatsApi,
  InterviewFeedbackDto,
  StudentDto,
  StudentsApi,
  TaskDtoTypeEnum,
} from 'api';
import { getTasksTotalScore } from 'domain/course';
import { ParsedUrlQuery } from 'querystring';
import type { CourseOnlyPageProps } from 'services/models';

export type StageFeedbackProps = CourseOnlyPageProps & {
  interviewId: number;
  student: StudentDto;
  courseSummary: {
    totalScore: number;
    studentsCount: number;
  };
  interviewFeedback: InterviewFeedbackDto;
  type: typeof TaskDtoTypeEnum.StageInterview;
};

/**
 * Gets stage interview data
 */
export async function getStageInterviewData({
  courseId,
  query,
}: {
  query: ParsedUrlQuery;
  courseId: number;
}): Promise<Omit<StageFeedbackProps, keyof CourseOnlyPageProps>> {
  validateQueryParams(query, ['studentId', 'interviewId']);

  const studentId = Number(query.studentId);
  const interviewId = Number(query.interviewId);

  const [
    { data: student },
    { data: tasks },
    {
      data: { activeStudentsCount },
    },
    { data: interviewFeedback },
  ] = await Promise.all([
    new StudentsApi().getStudent(Number(studentId)),
    new CoursesTasksApi().getCourseTasks(courseId),
    new CourseStatsApi().getCourseStats(courseId),
    new CoursesInterviewsApi().getInterviewFeedback(courseId, interviewId, TaskDtoTypeEnum.StageInterview),
  ]);
  if (!student) {
    throw new Error('Student not found');
  }

  return {
    interviewId,
    student,
    courseSummary: {
      totalScore: getTasksTotalScore(tasks),
      studentsCount: activeStudentsCount,
    },
    interviewFeedback,
    type: TaskDtoTypeEnum.StageInterview,
  };
}

function validateQueryParams(query: ParsedUrlQuery, params: string[]) {
  for (const param of params) {
    if (!query[param]) {
      throw new Error(`Parameter ${param} is not defined`);
    }
  }
}
