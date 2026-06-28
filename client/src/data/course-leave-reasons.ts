export const CourseLeaveReason = {
  TooDifficult: 'too_difficult',
  NotUseful: 'not_useful',
  LackOfTime: 'lack_of_time',
  Other: 'other',
  NoInterest: 'no_interest',
  PoorQuality: 'poor_quality',
  FoundAlternative: 'found_alternative',
  PersonalReasons: 'personal_reasons',
  GotJob: 'got_job',
  GotInternship: 'got_internship',
} as const;

export type CourseLeaveReason = (typeof CourseLeaveReason)[keyof typeof CourseLeaveReason];
