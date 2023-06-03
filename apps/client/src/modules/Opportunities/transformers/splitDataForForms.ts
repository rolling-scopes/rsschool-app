import { Contacts, UserData, AllUserCVData } from 'modules/Opportunities/models';

export const splitDataForForms = (data: AllUserCVData) => {
  const userData: Omit<UserData, 'uuid'> = {
    selfIntroLink: data.selfIntroLink,
    militaryService: data.militaryService,
    avatarLink: data.avatarLink,
    desiredPosition: data.desiredPosition,
    englishLevel: data.englishLevel,
    locations: data.locations,
    name: data.name,
    notes: data.notes,
    startFrom: data.startFrom,
    fullTime: data.fullTime,
  };

  const contacts: Contacts = {
    phone: data.phone,
    email: data.email,
    skype: data.skype,
    telegram: data.telegram,
    linkedin: data.linkedin,
    githubUsername: data.githubUsername,
    website: data.website,
  };

  return {
    userData,
    contacts,
    visibleCourses: data.visibleCourses,
  };
};
