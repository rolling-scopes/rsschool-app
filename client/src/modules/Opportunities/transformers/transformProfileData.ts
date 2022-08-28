import { ProfileInfo } from 'services/user';

export const transformProfileData = (profile: ProfileInfo) => {
  const name = profile.generalInfo?.name ?? null;
  const notes = profile.generalInfo?.aboutMyself ?? null;
  const location = profile.generalInfo?.location
    ? `${profile.generalInfo.location.cityName}, ${profile.generalInfo.location.countryName}`
    : null;

  const phone = profile.contacts?.phone ?? null;
  const email = profile.contacts?.email ?? null;
  const skype = profile.contacts?.skype ?? null;
  const telegram = profile.contacts?.telegram ?? null;
  const linkedin = profile.contacts?.linkedIn ?? null;

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
