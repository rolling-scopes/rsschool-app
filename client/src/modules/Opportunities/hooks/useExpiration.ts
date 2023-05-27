import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
import { ExpirationState } from 'modules/Opportunities/constants';

dayjs.extend(duration);

export const useExpiration = (expires: string) => {
  const expirationDate = dayjs(Number(expires));
  const expirationDateFormatted = expirationDate.format('YYYY-MM-DD');
  const diff = expirationDate.diff(Date.now());
  const daysLeft = dayjs.duration(diff).asDays();
  const expirationState =
    daysLeft < 0 ? ExpirationState.Expired : daysLeft < 2 ? ExpirationState.NearlyExpired : ExpirationState.NotExpired;

  return {
    expirationDateFormatted,
    expirationState,
  };
};
