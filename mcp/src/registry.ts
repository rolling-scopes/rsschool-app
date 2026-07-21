import type { ToolBinding } from './types.js';
import { APPROVE_MENTOR_TOOL, approveMentorInputSchema, runApproveMentor } from './tools/approve-mentor.js';
import {
  COMPLETE_CROSS_CHECK_TOOL,
  completeCrossCheckInputSchema,
  runCompleteCrossCheck,
} from './tools/complete-cross-check.js';
import {
  CREATE_COURSE_EVENT_TOOL,
  createCourseEventInputSchema,
  runCreateCourseEvent,
} from './tools/create-course-event.js';
import {
  CREATE_COURSE_TASK_TOOL,
  createCourseTaskInputSchema,
  runCreateCourseTask,
} from './tools/create-course-task.js';
import {
  CREATE_CROSS_CHECK_DISTRIBUTION_TOOL,
  createCrossCheckDistributionInputSchema,
  runCreateCrossCheckDistribution,
} from './tools/create-cross-check-distribution.js';
import {
  CREATE_INTERVIEW_RESULT_TOOL,
  createInterviewResultInputSchema,
  runCreateInterviewResult,
} from './tools/create-interview-result.js';
import {
  CREATE_STAGE_INTERVIEWS_TOOL,
  createStageInterviewsInputSchema,
  runCreateStageInterviews,
} from './tools/create-stage-interviews.js';
import {
  DELETE_COURSE_EVENT_TOOL,
  deleteCourseEventInputSchema,
  runDeleteCourseEvent,
} from './tools/delete-course-event.js';
import {
  DELETE_COURSE_TASK_TOOL,
  deleteCourseTaskInputSchema,
  runDeleteCourseTask,
} from './tools/delete-course-task.js';
import {
  DISTRIBUTE_INTERVIEW_PAIRS_TOOL,
  distributeInterviewPairsInputSchema,
  runDistributeInterviewPairs,
} from './tools/distribute-interview-pairs.js';
import {
  GET_COURSE_LEADERBOARD_TOOL,
  getCourseLeaderboardInputSchema,
  runGetCourseLeaderboard,
} from './tools/get-course-leaderboard.js';
import {
  GET_INTERVIEW_FEEDBACK_TOOL,
  getInterviewFeedbackInputSchema,
  runGetInterviewFeedback,
} from './tools/get-interview-feedback.js';
import {
  GET_MY_CROSS_CHECK_ASSIGNMENTS_TOOL,
  getMyCrossCheckAssignmentsInputSchema,
  runGetMyCrossCheckAssignments,
} from './tools/get-my-cross-check-assignments.js';
import {
  GET_MY_CROSS_CHECK_FEEDBACKS_TOOL,
  getMyCrossCheckFeedbacksInputSchema,
  runGetMyCrossCheckFeedbacks,
} from './tools/get-my-cross-check-feedbacks.js';
import { GET_MY_INTERVIEWS_TOOL, getMyInterviewsInputSchema, runGetMyInterviews } from './tools/get-my-interviews.js';
import {
  GET_MY_MENTOR_INTERVIEWS_TOOL,
  getMyMentorInterviewsInputSchema,
  runGetMyMentorInterviews,
} from './tools/get-my-mentor-interviews.js';
import {
  GRANT_COURSE_ROLES_TOOL,
  grantCourseRolesInputSchema,
  runGrantCourseRoles,
} from './tools/grant-course-roles.js';
import {
  LIST_COURSE_EVENTS_TOOL,
  listCourseEventsInputSchema,
  runListCourseEvents,
} from './tools/list-course-events.js';
import {
  LIST_MENTOR_REGISTRY_TOOL,
  listMentorRegistryInputSchema,
  runListMentorRegistry,
} from './tools/list-mentor-registry.js';
import {
  REGISTER_TO_INTERVIEW_TOOL,
  registerToInterviewInputSchema,
  runRegisterToInterview,
} from './tools/register-to-interview.js';
import {
  SUBMIT_CROSS_CHECK_REVIEW_TOOL,
  submitCrossCheckReviewInputSchema,
  runSubmitCrossCheckReview,
} from './tools/submit-cross-check-review.js';
import {
  SUBMIT_INTERVIEW_FEEDBACK_TOOL,
  submitInterviewFeedbackInputSchema,
  runSubmitInterviewFeedback,
} from './tools/submit-interview-feedback.js';
import {
  SUBMIT_MULTIPLE_SCORES_TOOL,
  submitMultipleScoresInputSchema,
  runSubmitMultipleScores,
} from './tools/submit-multiple-scores.js';
import {
  UPDATE_COURSE_EVENT_TOOL,
  updateCourseEventInputSchema,
  runUpdateCourseEvent,
} from './tools/update-course-event.js';
import {
  UPDATE_COURSE_TASK_TOOL,
  updateCourseTaskInputSchema,
  runUpdateCourseTask,
} from './tools/update-course-task.js';
import {
  LIST_EVENT_CATALOG_TOOL,
  listEventCatalogInputSchema,
  runListEventCatalog,
} from './tools/list-event-catalog.js';
import { LIST_TASK_CATALOG_TOOL, listTaskCatalogInputSchema, runListTaskCatalog } from './tools/list-task-catalog.js';
import { EXPEL_STUDENTS_TOOL, expelStudentsInputSchema, runExpelStudents } from './tools/expel-students.js';
import {
  GET_COURSE_INTERVIEWS_TOOL,
  getCourseInterviewsInputSchema,
  runGetCourseInterviews,
} from './tools/get-course-interviews.js';
import {
  GET_COURSE_SCHEDULE_TOOL,
  getCourseScheduleInputSchema,
  runGetCourseSchedule,
} from './tools/get-course-schedule.js';
import { GET_COURSE_STATS_TOOL, getCourseStatsInputSchema, runGetCourseStats } from './tools/get-course-stats.js';
import {
  GET_MENTOR_DASHBOARD_TOOL,
  getMentorDashboardInputSchema,
  runGetMentorDashboard,
} from './tools/get-mentor-dashboard.js';
import {
  GET_MENTOR_REVIEWS_TOOL,
  getMentorReviewsInputSchema,
  runGetMentorReviews,
} from './tools/get-mentor-reviews.js';
import {
  GET_MY_CROSS_CHECK_RESULT_TOOL,
  getMyCrossCheckResultInputSchema,
  runGetMyCrossCheckResult,
} from './tools/get-my-cross-check-result.js';
import {
  GET_MY_CROSS_CHECK_REVIEW_STATS_TOOL,
  getMyCrossCheckReviewStatsInputSchema,
  runGetMyCrossCheckReviewStats,
} from './tools/get-my-cross-check-review-stats.js';
import {
  GET_MY_INTERVIEW_STUDENTS_TOOL,
  getMyInterviewStudentsInputSchema,
  runGetMyInterviewStudents,
} from './tools/get-my-interview-students.js';
import { GET_MY_PROFILE_TOOL, getMyProfileInputSchema, runGetMyProfile } from './tools/get-my-profile.js';
import { GET_MY_SCORE_TOOL, getMyScoreInputSchema, runGetMyScore } from './tools/get-my-score.js';
import {
  GET_STUDENT_SUMMARY_TOOL,
  getStudentSummaryInputSchema,
  runGetStudentSummary,
} from './tools/get-student-summary.js';
import { ISSUE_CERTIFICATE_TOOL, issueCertificateInputSchema, runIssueCertificate } from './tools/issue-certificate.js';
import {
  ISSUE_CERTIFICATES_BULK_TOOL,
  issueCertificatesBulkInputSchema,
  runIssueCertificatesBulk,
} from './tools/issue-certificates-bulk.js';
import {
  LIST_COURSE_MENTORS_DETAILS_TOOL,
  listCourseMentorsDetailsInputSchema,
  runListCourseMentorsDetails,
} from './tools/list-course-mentors-details.js';
import {
  LIST_COURSE_STUDENTS_DETAILS_TOOL,
  listCourseStudentsDetailsInputSchema,
  runListCourseStudentsDetails,
} from './tools/list-course-students-details.js';
import { LIST_COURSE_TASKS_TOOL, listCourseTasksInputSchema, runListCourseTasks } from './tools/list-course-tasks.js';
import { LIST_MY_COURSES_TOOL, listMyCoursesInputSchema, runListMyCourses } from './tools/list-my-courses.js';
import { LIST_MY_STUDENTS_TOOL, listMyStudentsInputSchema, runListMyStudents } from './tools/list-my-students.js';
import {
  PREVIEW_ELIGIBLE_STUDENTS_TOOL,
  previewEligibleStudentsInputSchema,
  runPreviewEligibleStudents,
} from './tools/preview-eligible-students.js';
import { SEARCH_USERS_TOOL, searchUsersInputSchema, runSearchUsers } from './tools/search-users.js';
import { SUBMIT_TASK_SCORE_TOOL, submitTaskScoreInputSchema, runSubmitTaskScore } from './tools/submit-task-score.js';
import {
  SUBMIT_TASK_SOLUTION_TOOL,
  submitTaskSolutionInputSchema,
  runSubmitTaskSolution,
} from './tools/submit-task-solution.js';
import {
  UPDATE_STUDENT_STATUS_TOOL,
  updateStudentStatusInputSchema,
  runUpdateStudentStatus,
} from './tools/update-student-status.js';

// `openWorldHint` defaults to true in the spec, which is wrong for every tool
// here: they all talk to exactly one closed API. Set it explicitly everywhere.
const closedWorld = { openWorldHint: false } as const;

const readOnly = { ...closedWorld, readOnlyHint: true };
const write = { ...closedWorld, readOnlyHint: false };
/** Write whose repetition with the same arguments changes nothing further. */
const idempotentWrite = { ...closedWorld, readOnlyHint: false, idempotentHint: true };
const destructive = { ...closedWorld, readOnlyHint: false, destructiveHint: true };
/** Destructive but state-setting: re-applying the same state is a no-op. */
const destructiveIdempotent = { ...destructive, idempotentHint: true };

/** `list_my_courses` -> `List my courses`: clients show this instead of the raw name. */
function humanizeToolName(name: string): string {
  const words = name.split('_').join(' ');
  return words.charAt(0).toUpperCase() + words.slice(1);
}

/** Fills in a display title for every tool that didn't set one explicitly. */
function withDefaultTitles(bindings: ToolBinding[]): ToolBinding[] {
  return bindings.map(binding => ({
    ...binding,
    tool: {
      ...binding.tool,
      annotations: {
        ...binding.tool.annotations,
        title: binding.tool.annotations?.title ?? humanizeToolName(binding.tool.name),
      },
    },
  }));
}

export const TOOLS: ToolBinding[] = withDefaultTitles([
  // common — any authenticated user
  {
    tool: { ...LIST_MY_COURSES_TOOL, annotations: readOnly },
    schema: listMyCoursesInputSchema,
    roles: [],
    toolset: 'common',
    run: runListMyCourses as never,
  },
  {
    tool: { ...GET_MY_PROFILE_TOOL, annotations: readOnly },
    schema: getMyProfileInputSchema,
    roles: [],
    toolset: 'common',
    run: runGetMyProfile as never,
  },
  {
    tool: { ...GET_COURSE_SCHEDULE_TOOL, annotations: readOnly },
    schema: getCourseScheduleInputSchema,
    roles: [],
    toolset: 'common',
    run: runGetCourseSchedule as never,
  },
  {
    tool: { ...LIST_COURSE_TASKS_TOOL, annotations: readOnly },
    schema: listCourseTasksInputSchema,
    roles: [],
    toolset: 'common',
    run: runListCourseTasks as never,
  },

  // student
  {
    tool: { ...GET_MY_SCORE_TOOL, annotations: readOnly },
    schema: getMyScoreInputSchema,
    roles: ['student'],
    toolset: 'student',
    run: runGetMyScore as never,
  },
  {
    tool: { ...SUBMIT_TASK_SOLUTION_TOOL, annotations: write },
    schema: submitTaskSolutionInputSchema,
    roles: ['student'],
    toolset: 'student',
    run: runSubmitTaskSolution as never,
  },
  {
    tool: { ...GET_MY_CROSS_CHECK_REVIEW_STATS_TOOL, annotations: readOnly },
    schema: getMyCrossCheckReviewStatsInputSchema,
    roles: ['student'],
    toolset: 'student',
    run: runGetMyCrossCheckReviewStats as never,
  },
  {
    tool: { ...GET_MY_CROSS_CHECK_RESULT_TOOL, annotations: readOnly },
    schema: getMyCrossCheckResultInputSchema,
    roles: ['student'],
    toolset: 'student',
    run: runGetMyCrossCheckResult as never,
  },
  {
    tool: { ...GET_COURSE_INTERVIEWS_TOOL, annotations: readOnly },
    schema: getCourseInterviewsInputSchema,
    roles: ['student'],
    toolset: 'student',
    run: runGetCourseInterviews as never,
  },

  // mentor
  {
    tool: { ...LIST_MY_STUDENTS_TOOL, annotations: readOnly },
    schema: listMyStudentsInputSchema,
    roles: ['mentor'],
    toolset: 'mentor',
    run: runListMyStudents as never,
  },
  {
    tool: { ...GET_MENTOR_DASHBOARD_TOOL, annotations: readOnly },
    schema: getMentorDashboardInputSchema,
    roles: ['mentor'],
    toolset: 'mentor',
    run: runGetMentorDashboard as never,
  },
  {
    tool: { ...GET_STUDENT_SUMMARY_TOOL, annotations: readOnly },
    schema: getStudentSummaryInputSchema,
    roles: ['mentor', 'supervisor', 'dementor', 'manager'],
    toolset: 'mentor',
    run: runGetStudentSummary as never,
  },
  {
    tool: { ...SUBMIT_TASK_SCORE_TOOL, annotations: write },
    schema: submitTaskScoreInputSchema,
    roles: ['mentor', 'taskOwner', 'manager'],
    toolset: 'mentor',
    run: runSubmitTaskScore as never,
  },
  {
    tool: { ...GET_MY_INTERVIEW_STUDENTS_TOOL, annotations: readOnly },
    schema: getMyInterviewStudentsInputSchema,
    roles: ['mentor'],
    toolset: 'mentor',
    run: runGetMyInterviewStudents as never,
  },
  {
    tool: { ...UPDATE_STUDENT_STATUS_TOOL, annotations: destructiveIdempotent },
    schema: updateStudentStatusInputSchema,
    roles: ['mentor', 'supervisor', 'dementor', 'manager'],
    toolset: 'mentor',
    run: runUpdateStudentStatus as never,
  },

  // course-management
  {
    tool: { ...PREVIEW_ELIGIBLE_STUDENTS_TOOL, annotations: readOnly },
    schema: previewEligibleStudentsInputSchema,
    roles: ['manager'],
    toolset: 'course-management',
    run: runPreviewEligibleStudents as never,
  },
  {
    tool: { ...ISSUE_CERTIFICATE_TOOL, annotations: write },
    schema: issueCertificateInputSchema,
    roles: ['manager'],
    toolset: 'course-management',
    run: runIssueCertificate as never,
  },
  {
    tool: { ...ISSUE_CERTIFICATES_BULK_TOOL, annotations: destructive },
    schema: issueCertificatesBulkInputSchema,
    roles: ['manager'],
    toolset: 'course-management',
    run: runIssueCertificatesBulk as never,
  },
  {
    tool: { ...GET_COURSE_STATS_TOOL, annotations: readOnly },
    schema: getCourseStatsInputSchema,
    roles: ['manager', 'supervisor', 'dementor'],
    toolset: 'course-management',
    run: runGetCourseStats as never,
  },
  {
    tool: { ...LIST_COURSE_STUDENTS_DETAILS_TOOL, annotations: readOnly },
    schema: listCourseStudentsDetailsInputSchema,
    roles: ['manager', 'supervisor', 'dementor'],
    toolset: 'course-management',
    run: runListCourseStudentsDetails as never,
  },
  {
    tool: { ...LIST_COURSE_MENTORS_DETAILS_TOOL, annotations: readOnly },
    schema: listCourseMentorsDetailsInputSchema,
    roles: ['manager', 'supervisor'],
    toolset: 'course-management',
    run: runListCourseMentorsDetails as never,
  },
  {
    tool: { ...GET_MENTOR_REVIEWS_TOOL, annotations: readOnly },
    schema: getMentorReviewsInputSchema,
    roles: ['dementor', 'manager'],
    toolset: 'course-management',
    run: runGetMentorReviews as never,
  },
  {
    tool: { ...EXPEL_STUDENTS_TOOL, annotations: destructive },
    schema: expelStudentsInputSchema,
    roles: ['manager'],
    toolset: 'course-management',
    run: runExpelStudents as never,
  },

  // users
  {
    tool: { ...SEARCH_USERS_TOOL, annotations: readOnly },
    schema: searchUsersInputSchema,
    roles: ['manager'],
    toolset: 'users',
    run: runSearchUsers as never,
  },

  // common (wave 2)
  {
    tool: { ...GET_COURSE_LEADERBOARD_TOOL, annotations: readOnly },
    schema: getCourseLeaderboardInputSchema,
    roles: [],
    toolset: 'common',
    run: runGetCourseLeaderboard as never,
  },
  {
    tool: { ...LIST_COURSE_EVENTS_TOOL, annotations: readOnly },
    schema: listCourseEventsInputSchema,
    roles: [],
    toolset: 'common',
    run: runListCourseEvents as never,
  },

  // student (wave 2)
  {
    tool: { ...GET_MY_CROSS_CHECK_ASSIGNMENTS_TOOL, annotations: readOnly },
    schema: getMyCrossCheckAssignmentsInputSchema,
    roles: ['student'],
    toolset: 'student',
    run: runGetMyCrossCheckAssignments as never,
  },
  {
    tool: { ...SUBMIT_CROSS_CHECK_REVIEW_TOOL, annotations: write },
    schema: submitCrossCheckReviewInputSchema,
    roles: ['student'],
    toolset: 'student',
    run: runSubmitCrossCheckReview as never,
  },
  {
    tool: { ...GET_MY_CROSS_CHECK_FEEDBACKS_TOOL, annotations: readOnly },
    schema: getMyCrossCheckFeedbacksInputSchema,
    roles: ['student'],
    toolset: 'student',
    run: runGetMyCrossCheckFeedbacks as never,
  },
  {
    tool: { ...GET_MY_INTERVIEWS_TOOL, annotations: readOnly },
    schema: getMyInterviewsInputSchema,
    roles: ['student'],
    toolset: 'student',
    run: runGetMyInterviews as never,
  },
  {
    tool: { ...REGISTER_TO_INTERVIEW_TOOL, annotations: write },
    schema: registerToInterviewInputSchema,
    roles: ['student'],
    toolset: 'student',
    run: runRegisterToInterview as never,
  },

  // mentor (wave 2)
  {
    tool: { ...GET_MY_MENTOR_INTERVIEWS_TOOL, annotations: readOnly },
    schema: getMyMentorInterviewsInputSchema,
    roles: ['mentor'],
    toolset: 'mentor',
    run: runGetMyMentorInterviews as never,
  },
  {
    tool: { ...GET_INTERVIEW_FEEDBACK_TOOL, annotations: readOnly },
    schema: getInterviewFeedbackInputSchema,
    roles: ['mentor', 'supervisor', 'manager'],
    toolset: 'mentor',
    run: runGetInterviewFeedback as never,
  },
  {
    tool: { ...SUBMIT_INTERVIEW_FEEDBACK_TOOL, annotations: write },
    schema: submitInterviewFeedbackInputSchema,
    roles: ['mentor', 'supervisor', 'manager'],
    toolset: 'mentor',
    run: runSubmitInterviewFeedback as never,
  },
  {
    tool: { ...CREATE_INTERVIEW_RESULT_TOOL, annotations: write },
    schema: createInterviewResultInputSchema,
    roles: ['mentor'],
    toolset: 'mentor',
    run: runCreateInterviewResult as never,
  },
  {
    tool: { ...SUBMIT_MULTIPLE_SCORES_TOOL, annotations: write },
    schema: submitMultipleScoresInputSchema,
    roles: ['taskOwner', 'mentor', 'manager'],
    toolset: 'mentor',
    run: runSubmitMultipleScores as never,
  },

  // course-admin (wave 2)
  {
    tool: { ...CREATE_COURSE_TASK_TOOL, annotations: write },
    schema: createCourseTaskInputSchema,
    roles: ['manager'],
    toolset: 'course-admin',
    run: runCreateCourseTask as never,
  },
  {
    tool: { ...UPDATE_COURSE_TASK_TOOL, annotations: idempotentWrite },
    schema: updateCourseTaskInputSchema,
    roles: ['manager'],
    toolset: 'course-admin',
    run: runUpdateCourseTask as never,
  },
  {
    tool: { ...DELETE_COURSE_TASK_TOOL, annotations: destructive },
    schema: deleteCourseTaskInputSchema,
    roles: ['manager'],
    toolset: 'course-admin',
    run: runDeleteCourseTask as never,
  },
  {
    tool: { ...CREATE_COURSE_EVENT_TOOL, annotations: write },
    schema: createCourseEventInputSchema,
    roles: ['manager'],
    toolset: 'course-admin',
    run: runCreateCourseEvent as never,
  },
  {
    tool: { ...UPDATE_COURSE_EVENT_TOOL, annotations: idempotentWrite },
    schema: updateCourseEventInputSchema,
    roles: ['manager'],
    toolset: 'course-admin',
    run: runUpdateCourseEvent as never,
  },
  {
    tool: { ...DELETE_COURSE_EVENT_TOOL, annotations: destructive },
    schema: deleteCourseEventInputSchema,
    roles: ['manager'],
    toolset: 'course-admin',
    run: runDeleteCourseEvent as never,
  },
  {
    tool: { ...CREATE_CROSS_CHECK_DISTRIBUTION_TOOL, annotations: write },
    schema: createCrossCheckDistributionInputSchema,
    roles: ['manager'],
    toolset: 'course-admin',
    run: runCreateCrossCheckDistribution as never,
  },
  {
    tool: { ...COMPLETE_CROSS_CHECK_TOOL, annotations: write },
    schema: completeCrossCheckInputSchema,
    roles: ['manager'],
    toolset: 'course-admin',
    run: runCompleteCrossCheck as never,
  },
  {
    tool: { ...CREATE_STAGE_INTERVIEWS_TOOL, annotations: write },
    schema: createStageInterviewsInputSchema,
    roles: ['manager'],
    toolset: 'course-admin',
    run: runCreateStageInterviews as never,
  },
  {
    tool: { ...DISTRIBUTE_INTERVIEW_PAIRS_TOOL, annotations: write },
    schema: distributeInterviewPairsInputSchema,
    roles: ['manager'],
    toolset: 'course-admin',
    run: runDistributeInterviewPairs as never,
  },
  {
    tool: { ...LIST_MENTOR_REGISTRY_TOOL, annotations: readOnly },
    schema: listMentorRegistryInputSchema,
    roles: ['manager', 'supervisor'],
    toolset: 'course-admin',
    run: runListMentorRegistry as never,
  },
  {
    tool: { ...APPROVE_MENTOR_TOOL, annotations: idempotentWrite },
    schema: approveMentorInputSchema,
    roles: ['manager', 'supervisor'],
    toolset: 'course-admin',
    run: runApproveMentor as never,
  },
  {
    tool: { ...GRANT_COURSE_ROLES_TOOL, annotations: idempotentWrite },
    schema: grantCourseRolesInputSchema,
    roles: ['manager'],
    toolset: 'course-admin',
    run: runGrantCourseRoles as never,
  },
  {
    tool: { ...LIST_TASK_CATALOG_TOOL, annotations: readOnly },
    schema: listTaskCatalogInputSchema,
    roles: ['manager'],
    toolset: 'course-admin',
    run: runListTaskCatalog as never,
  },
  {
    tool: { ...LIST_EVENT_CATALOG_TOOL, annotations: readOnly },
    schema: listEventCatalogInputSchema,
    roles: ['manager'],
    toolset: 'course-admin',
    run: runListEventCatalog as never,
  },
]);
