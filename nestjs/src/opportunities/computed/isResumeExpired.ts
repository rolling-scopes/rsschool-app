import { DateTime } from 'luxon';

const RESUME_VALID_DAYS = 30;

export const isExpired = (updatedDate: string) => {
  return DateTime.fromISO(updatedDate).plus({ days: RESUME_VALID_DAYS }).toMillis() < DateTime.now().toMillis();
};
