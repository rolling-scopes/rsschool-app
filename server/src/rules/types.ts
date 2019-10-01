export type TaskOwnerCourses = {
  id: number;
  tasksIds: number[];
};

export type TaskOwnerRole = {
  courses: TaskOwnerCourses[];
};
