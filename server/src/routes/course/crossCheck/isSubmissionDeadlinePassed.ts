export const isSubmissionDeadlinePassed = (studentEndDate: string) => {
  const currentTimestamp = new Date().getTime();
  const submitDeadlineTimestamp = new Date(studentEndDate).getTime();
  return currentTimestamp > submitDeadlineTimestamp;
};
