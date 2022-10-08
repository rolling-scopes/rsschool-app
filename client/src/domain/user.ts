import { CourseRole, Session } from 'components/withSession';
import { keys } from 'lodash';

function hasRole(session: Session, courseId: number, role: CourseRole) {
  return session.courses[courseId]?.roles.includes(role) ?? false;
}

export function isExpelledStudent(session: Session, courseId: number) {
  return session.courses[courseId]?.isExpelled === true;
}

function hasRoleInAny(session: Session, role: CourseRole) {
  return keys(session.courses).some(courseId => hasRole(session, Number(courseId), role));
}

export function isAdmin(session: Session) {
  return Boolean(session.isAdmin);
}

export function isMentor(session: Session, courseId: number) {
  return !!courseId && hasRole(session, courseId, CourseRole.Mentor);
}

export function getMentorId(session: Session, courseId: number) {
  return session.courses[courseId]?.mentorId ?? null;
}

export function isAnyMentor(session: Session) {
  return hasRoleInAny(session, CourseRole.Mentor);
}

export function isStudent(session: Session, courseId: number) {
  return !!courseId && hasRole(session, courseId, CourseRole.Student);
}

export function isActiveStudent(session: Session, courseId: number) {
  return isStudent(session, courseId) && !isExpelledStudent(session, courseId);
}

export function isCourseManager(session: Session, courseId: number) {
  return isAdmin(session) || hasRole(session, courseId, CourseRole.Manager);
}

export function isPowerUser(session: Session, courseId: number) {
  return isAdmin(session) || isCourseManager(session, courseId) || isCourseSupervisor(session, courseId);
}

export function isAnyCourseManager(session: Session) {
  return hasRoleInAny(session, CourseRole.Manager);
}

export function isCourseSupervisor(session: Session, courseId: number) {
  return isAdmin(session) || hasRole(session, courseId, CourseRole.Supervisor);
}

export function isAnyCourseSupervisor(session: Session) {
  return isAdmin(session) || hasRoleInAny(session, CourseRole.Supervisor);
}

export function isAnyCoursePowerUser(session: Session) {
  return isAdmin(session) || hasRoleInAny(session, CourseRole.Manager) || hasRoleInAny(session, CourseRole.Supervisor);
}

export function isTaskOwner(session: Session, courseId: number) {
  return hasRole(session, courseId, CourseRole.TaskOwner);
}

export function isHirer(session: Session) {
  return Boolean(session.isHirer);
}
