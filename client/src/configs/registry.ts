import { Session } from '@client/components/withSession';
import { Course } from '@client/services/models';

export const TYPES = {
  MENTOR: 'mentor',
  STUDENT: 'student',
};

export type Props = {
  courses?: Course[];
  session: Session;
};
