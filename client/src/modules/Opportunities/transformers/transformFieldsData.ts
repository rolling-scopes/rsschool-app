import dayjs from 'dayjs';
import { AllDataToSubmit } from 'modules/Opportunities/models';

const LOCATIONS_COUNT = 3;

const getTopLocations = (locationsRaw: string | null, length: number) =>
  locationsRaw
    ? locationsRaw
        .split(',')
        .slice(0, length)
        .map(location => location.trim())
        .join(',')
    : null;

const nullifyConditional = (str?: string | null) => str?.trim() || null;

export const transformFieldsData = (data: AllDataToSubmit) => ({
  selfIntroLink: nullifyConditional(data.selfIntroLink),
  militaryService: data.militaryService,
  avatarLink: nullifyConditional(data.avatarLink),
  desiredPosition: nullifyConditional(data.desiredPosition),
  englishLevel: data.englishLevel,
  name: nullifyConditional(data.name),
  notes: nullifyConditional(data.notes),
  phone: nullifyConditional(data.phone),
  email: nullifyConditional(data.email),
  skype: nullifyConditional(data.skype),
  telegram: nullifyConditional(data.telegram),
  linkedin: nullifyConditional(data.linkedin),
  locations: getTopLocations(data.locations, LOCATIONS_COUNT),
  githubUsername: nullifyConditional(data.githubUsername),
  website: nullifyConditional(data.website),
  startFrom: data.startFrom && dayjs(data.startFrom).format('YYYY-MM-DD'),
  fullTime: data.fullTime,
  visibleCourses: data.visibleCourses,
});
