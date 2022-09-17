import { ResumeDto } from 'api';

export const transformCvData = (data: ResumeDto | null) => {
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
    startFrom: startFrom ?? null,
    fullTime: !!fullTime,
  };

  const contacts = {
    email: email ?? null,
    github: githubUsername ?? null,
    linkedin: linkedin ?? null,
    locations: locations ?? null,
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
