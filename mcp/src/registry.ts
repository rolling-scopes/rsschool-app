import type { ToolBinding } from './types.js';
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

const readOnly = { readOnlyHint: true };
const write = { readOnlyHint: false };
const destructive = { readOnlyHint: false, destructiveHint: true };

export const TOOLS: ToolBinding[] = [
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
    tool: { ...UPDATE_STUDENT_STATUS_TOOL, annotations: destructive },
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
    tool: { ...ISSUE_CERTIFICATES_BULK_TOOL, annotations: write },
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
];
