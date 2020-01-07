import { Session } from 'components/withSession';
import { Course } from 'services/models';

export const TYPES = {
  MENTOR: 'mentor',
  STUDENT: 'student',
};

export type Props = {
  courses?: Course[];
  session: Session;
};
