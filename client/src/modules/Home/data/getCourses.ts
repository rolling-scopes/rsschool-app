import { Session } from 'components/withSession';
import { Course } from 'services/models';
import { isStudent } from 'domain/user';
import { isEmpty } from 'lodash';

export const getCourses = (session: Session, courses: Course[]) => {
  if (!session || !courses) {
    return [];
  }
  const { isAdmin } = session;
  // TODO: it seems no need to filter. It is done on the server already.
  return courses
    .filter(course => isAdmin || session.courses[course.id] || !isEmpty(session.courses?.[course.id]))
    .filter(course => !(!isAdmin && course.alias === 'epamlearningjs' && isStudent(session, course.id)))
    .sort((a, b) => (a.startDate && b.startDate ? b.startDate.localeCompare(a.startDate) : 0));
};
