import { CourseRole, Session } from 'components/withSession';
import { values } from 'lodash';

export function isAdmin(session: Session) {
  return session.isAdmin;
}

export function isMentor(session: Session, courseId: number) {
  return !!courseId && session.courses[courseId].roles.includes(CourseRole.Mentor);
}

export function isAnyMentor(session: Session, _?: number) {
  return values(session.courses).some(item => item.roles.includes(CourseRole.Mentor) ?? false);
}

export function isStudent(session: Session, courseId: number) {
  return !!courseId && (session?.courses[courseId]?.roles?.includes(CourseRole.Student) ?? false);
}

export function isCourseManager(session: Session, courseId: number) {
  return session.isAdmin || (session.courses?.[courseId].roles?.includes(CourseRole.Manager) ?? false);
}

export function isPowerUser(session: Session, courseId: number) {
  return session.isAdmin || isCourseManager(session, courseId) || isCourseSupervisor(session, courseId);
}

export function isAnyCourseManager(session: Session) {
  return values(session.courses).some(item => item?.roles.includes(CourseRole.Manager));
}

export function isCourseSupervisor(session: Session, courseId: number) {
  return session.isAdmin || (session.courses?.[courseId]?.roles.includes(CourseRole.Supervisor) ?? false);
}

export function isAnyCourseSupervisor(session: Session) {
  return values(session.courses).some(item => item?.roles.includes(CourseRole.Supervisor));
}

export function isAnyCoursePowerUserManager(session: Session) {
  return isAnyCourseManager(session) || isAnyCourseSupervisor(session);
}

export function isTaskOwner(session: Session, courseId: number) {
  return session.courses?.[courseId]?.roles.includes(CourseRole.TaskOwner) ?? false;
}

export function isJuryActivist(session: Session, courseId: number) {
  return session.courses?.[courseId]?.roles.includes(CourseRole.JuryActivist) ?? false;
}

export function isHirer(session: Session) {
  return session.isHirer;
}
