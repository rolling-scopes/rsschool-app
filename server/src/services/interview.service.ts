import { getCustomRepository, getRepository } from 'typeorm';
import { CourseTask, TaskChecker } from '../models';
import { MentorRepository } from '../repositories/mentor';
import { createCrossMentorPairs } from '../rules/distribution';
import { InterviewRepository } from '../repositories/interview';

export async function createInterviewsAutomatically(
  courseId: number,
  courseTaskId: number,
  options: { clean: boolean; registrationEnabled: boolean },
) {
  const courseTask = await getRepository(CourseTask).findOne({ where: { id: courseTaskId }, select: ['id'] });

  if (courseTask == null) {
    return null;
  }

  const mentorRepository = getCustomRepository(MentorRepository);
  const mentors = await mentorRepository.findActive(courseId, true);

  if (mentors.length === 0) {
    return [];
  }

  const checkerRepository = getRepository(TaskChecker);

  if (options.clean) {
    await checkerRepository.delete({ courseTaskId });
  }

  let registeredStudentsIds: number[] | undefined = undefined;
  if (options.registrationEnabled) {
    const student = await getCustomRepository(InterviewRepository).findRegisteredStudents(courseId, courseTaskId);
    registeredStudentsIds = student.map(student => student.id);
  }

  const existingPairs = await checkerRepository.find({ courseTaskId });

  const { mentors: crossMentors } = createCrossMentorPairs(mentors, existingPairs, registeredStudentsIds);

  const taskCheckPairs = crossMentors
    .map(stm => stm.students?.map(s => ({ courseTaskId, mentorId: stm.id, studentId: s.id })) ?? [])
    .reduce((acc, student) => acc.concat(student), []);

  if (taskCheckPairs.length > 0) {
    await checkerRepository.insert(taskCheckPairs);
  }

  return taskCheckPairs;
}

export async function getInterviewPairs(courseTaskId: number) {
  return getCustomRepository(InterviewRepository).findByInterviewId(courseTaskId);
}

export async function cancelInterviewPair(pairId: number) {
  return getCustomRepository(InterviewRepository).cancelById(pairId);
}

export async function createInterview(
  courseId: number,
  courseTaskId: number,
  interviewerGithubId: string,
  studentGithubId: string,
) {
  return getCustomRepository(InterviewRepository).addPair(courseId, courseTaskId, interviewerGithubId, studentGithubId);
}
