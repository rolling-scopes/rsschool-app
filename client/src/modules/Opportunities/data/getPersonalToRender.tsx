import { UserData, MilitaryServiceStatus } from 'common/models/cv';
import capitalize from 'lodash/capitalize';

export function getPersonalToRender(user: UserData) {
  const { selfIntroLink } = user;
  return [
    {
      title: 'English',
      value: user.englishLevel,
    },
    {
      title: 'Self Introduction',
      value: selfIntroLink ? (
        <a className="rs-link" target="_blank" rel="nofollow" href={selfIntroLink}>
          {selfIntroLink}
        </a>
      ) : (
        'Not Available'
      ),
    },
    {
      title: 'Ready to work full time',
      value: user.fullTime ? 'Yes' : 'No',
    },
    {
      title: 'Ready to work from',
      value: user.startFrom,
    },
    {
      title: 'Military service status',
      value: user.militaryService ? capitalize(militaryServiceDictionary[user.militaryService]) : 'Unknown',
    },
  ];
}

const militaryServiceDictionary: {
  [key in MilitaryServiceStatus]: string;
} = {
  served: 'served',
  notLiable: 'not liable',
  liable: 'liable',
};
