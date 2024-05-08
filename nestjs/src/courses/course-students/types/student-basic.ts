import Discord from './discord';
import MentorBasic from './mentor-basic';
import UserBasic from './user-basic';

export default interface StudentBasic extends UserBasic {
  isActive: boolean;
  cityName?: string | null;
  countryName?: string | null;
  mentor:
    | MentorBasic
    | { id: number }
    | {
        id: number;
        githubId: string;
        name: string;
      }
    | null;
  discord: Discord | null;
  totalScore: number;
  rank?: number;
}
