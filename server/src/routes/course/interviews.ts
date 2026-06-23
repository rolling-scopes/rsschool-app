import { ILogger } from '../../logger';
import { courseService, notificationService } from '../../services';

export async function sendInteviewerAssignedNotification(
  logger: ILogger,
  courseId: number,
  {
    interviewerGithubId,
    interviewerId,
    studentGithubId,
    studentId,
  }: {
    interviewerGithubId?: string;
    studentGithubId?: string | undefined;
    studentId?: number;
    interviewerId?: number;
  },
) {
  if ((!interviewerGithubId && !interviewerId) || (!studentId && !studentGithubId)) {
    logger.info(`sendInteviewerAssignedNotification: missing id info`);
    return;
  }
  try {
    const mentorRequest =
      (interviewerGithubId !== undefined && courseService.queryMentorByGithubId(courseId, interviewerGithubId)) ||
      (interviewerId !== undefined && courseService.queryMentorById(courseId, interviewerId));

    const studentRequest =
      (studentGithubId !== undefined && courseService.queryStudentByGithubId(courseId, studentGithubId)) ||
      (studentId !== undefined && courseService.queryStudentById(courseId, studentId));

    if (!mentorRequest || !studentRequest) return;
    const [interviewer, student] = await Promise.all([mentorRequest, studentRequest]);
    if (!student || !interviewer) return;

    await notificationService.sendNotification({
      userId: student.userId,
      notificationId: 'interviewerAssigned',
      data: {
        interviewer,
      },
    });
  } catch (e) {
    logger.error(`sendInteviewerAssignedNotification: ${(e as Error).message}`);
  }
}
