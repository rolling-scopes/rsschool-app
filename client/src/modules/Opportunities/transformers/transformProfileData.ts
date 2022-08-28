import { ProfileInfo } from 'services/user';

export const transformProfileData = (data: ProfileInfo) => {
  const name = data.generalInfo?.name ?? null;
  const notes = data.generalInfo?.aboutMyself ?? null;
  const location = data.generalInfo?.location
    ? `${data.generalInfo.location.cityName}, ${data.generalInfo.location.countryName}`
    : null;

  const phone = data.contacts?.phone ?? null;
  const email = data.contacts?.email ?? null;
  const skype = data.contacts?.skype ?? null;
  const telegram = data.contacts?.telegram ?? null;
  const linkedin = data.contacts?.linkedIn ?? null;

  return {
    name,
    notes,
    location,
    phone,
    email,
    skype,
    telegram,
    linkedin,
  };
};
