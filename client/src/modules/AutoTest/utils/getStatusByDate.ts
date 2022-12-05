import moment from 'moment';

export enum AutoTestTaskStatus {
  Uncompleted = 'Uncompleted',
  Missed = 'Missed',
  Completed = 'Completed',
  DeadlineSoon = 'Deadline soon',
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

  if (end.diff(now, 'h') < 48) {
    return AutoTestTaskStatus.DeadlineSoon;
  }

  return AutoTestTaskStatus.Uncompleted;
}

export default getStatusByDate;
