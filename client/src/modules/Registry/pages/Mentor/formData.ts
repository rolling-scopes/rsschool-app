import { Location } from 'common/models';
import { UserFull } from 'services/user';

export function getInitialValues({ countryName, cityName, ...initialData }: Partial<UserFull>, checkedList: number[]) {
  const location =
    countryName &&
    cityName &&
    ({
      countryName,
      cityName,
    } as Location | null);
  return {
    ...initialData,
    location,
    preferedCourses: checkedList,
    englishMentoring: false,
    technicalMentoring: [],
  };
}

export type FormData = ReturnType<typeof getInitialValues>;
