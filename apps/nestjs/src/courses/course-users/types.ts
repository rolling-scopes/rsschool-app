import { CourseUser } from '@entities/courseUser';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
import { UpdateCourseUserDto } from './dto/update-user.dto';

export type PartialCourseUserData = QueryDeepPartialEntity<CourseUser> | QueryDeepPartialEntity<CourseUser>[];

export type ExtendedCourseUser = Omit<CourseUser, 'course' | 'user'> & {
  name: string;
  githubId: string;
};

export type SplitCourseUsers = {
  usersToInsert: UpdateCourseUserDto[];
  usersToUpdate: CourseUser[];
};
