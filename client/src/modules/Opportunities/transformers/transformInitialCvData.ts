import { ResumeDto } from '@client/api';

export const transformInitialCvData = (data: ResumeDto | null) => {
  const {
    notes,
    name,
    selfIntroLink,
    militaryService,
    avatarLink,
    desiredPosition,
    englishLevel,
    email,
    githubUsername,
    linkedin,
    locations,
    phone,
    skype,
    telegram,
    website,
    startFrom,
    fullTime,
    courses = [],
    visibleCourses = [],
  } = data ?? {};

  const userData = {
    notes: notes ?? null,
    name: name ?? null,
    selfIntroLink: selfIntroLink ?? null,
    militaryService: militaryService ?? null,
    avatarLink: avatarLink ?? null,
    desiredPosition: desiredPosition ?? null,
    englishLevel: englishLevel ?? null,
    locations: locations ?? null,
    startFrom: startFrom ?? null,
    fullTime: !!fullTime,
  };

  const contacts = {
    email: email ?? null,
    githubUsername: githubUsername ?? null,
    linkedin: linkedin ?? null,
    phone: phone ?? null,
    skype: skype ?? null,
    telegram: telegram ?? null,
    website: website ?? null,
  };

  return {
    contacts,
    userData,
    visibleCourses,
    courses,
  };
};
