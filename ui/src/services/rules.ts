interface CourseTask {
  studentEndDate: string | null;
}

export const sortTasksByEndDate = (a: CourseTask, b: CourseTask) => {
  if (!b.studentEndDate && a.studentEndDate) {
    return -1;
  }
  if (!a.studentEndDate && b.studentEndDate) {
    return 1;
  }
  if (!a.studentEndDate && !b.studentEndDate) {
    return 0;
  }
  return new Date(a.studentEndDate!).getTime() - new Date(b.studentEndDate!).getTime();
};
