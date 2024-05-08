import StudentBasic from './student-basic';
import UserBasic from './user-basic';

export default interface MentorBasic extends UserBasic {
  isActive: boolean;
  cityName: string;
  countryName: string;
  students: (StudentBasic | { id: number })[];
}
