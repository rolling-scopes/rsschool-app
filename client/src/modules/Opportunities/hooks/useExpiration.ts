import moment from 'moment';
import { ExpirationState } from 'modules/Opportunities/constants';

export const useExpiration = (expires: string) => {
  const expirationDate = moment(Number(expires));
  const expirationDateFormatted = expirationDate.format('YYYY-MM-DD');
  const diff = expirationDate.diff(Date.now());
  const daysLeft = moment.duration(diff).asDays();
  const expirationState =
    daysLeft < 0 ? ExpirationState.Expired : daysLeft < 2 ? ExpirationState.NearlyExpired : ExpirationState.NotExpired;

  return {
    expirationDateFormatted,
    expirationState,
  };
};
