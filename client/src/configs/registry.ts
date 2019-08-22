import { Session } from 'components/withSession';
import { CITIES } from 'services/reference-data';
import { Course } from 'services/course';

export const TYPES = {
  MENTOR: 'mentor',
  STUDENT: 'student',
};

export type Props = {
  courses?: Course[];
  session?: Session;
};

export type SelectCourse = {
  label?: string;
  value?: number;
};

export const citiesOptions = [{ id: '', name: '(Empty)' }]
  .concat(CITIES)
  .map(city => ({ label: city.name, value: city.id }));
