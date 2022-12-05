import moment from 'moment';

export enum AutoTestTaskStatus {
  Uncompleted = 'Uncompleted',
  Missed = 'Missed',
  Completed = 'Completed',
}

function getStatusByDate(endDate: string, score?: number | null): AutoTestTaskStatus {
  const now = moment();
  const end = moment(endDate);

  if (now.isAfter(end) && score) {
    return AutoTestTaskStatus.Completed;
  }

  if (now.isAfter(end) && !score) {
    return AutoTestTaskStatus.Missed;
  }

  return AutoTestTaskStatus.Uncompleted;
}

export default getStatusByDate;
