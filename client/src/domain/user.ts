import { values } from 'lodash';
import { Session } from 'components/withSession';

export function isCourseManager(session: Session, courseId: number) {
  return session.isAdmin || session.coursesRoles?.[courseId]?.includes('manager');
}

export function isAnyCourseManager(session: Session) {
  return values(session.coursesRoles).some(item => item?.includes('manager'));
}
