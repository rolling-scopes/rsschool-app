import { Session } from 'components/withSession';

export function isCourseManager(session: Session, courseId: number) {
  return session.isAdmin || session.coursesRoles?.[courseId]?.includes('manager');
}
