export interface IUser {
  id: number;
  githubId: string;
  name: string;
}

export interface IBestWork {
  id: number;
  users: IUser[];
  projectUrl: string;
  imageUrl: string;
  tags: string[];
  task: number;
  course: number;
}

export interface IForm {
  users: number[];
  task: number;
  projectUrl: string;
  imageUrl: string;
  tags: string[];
}

export interface IPostBestWork extends IForm {
  id?: number;
  course: number;
}

export interface ICourse {
  courseId: number;
  courseName: string;
}

export interface ITask {
  taskId: number;
  taskName: string;
}
