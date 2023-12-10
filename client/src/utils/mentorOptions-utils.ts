import { MentorResponse } from 'services/mentorRegistry';
import { Course } from 'services/models';

export const mapMentorData = (mentor: MentorResponse, course: Course | null): MentorResponse => {
  const courseMinStudentsPerMentorValue = course?.minStudentsPerMentor;
  if (courseMinStudentsPerMentorValue && courseMinStudentsPerMentorValue > Number(mentor?.maxStudentsLimit)) {
    mentor.maxStudentsLimit = courseMinStudentsPerMentorValue;
  }
  return mentor;
};
