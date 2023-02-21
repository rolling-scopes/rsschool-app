import { CourseUser } from '@entities/courseUser';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
import { PutUsersDto } from './dto/put-users.dto';

export type PartialCourseUserData = QueryDeepPartialEntity<CourseUser> | QueryDeepPartialEntity<CourseUser>[];

export type ExtendedCourseUser = Omit<CourseUser, 'course' | 'user'> & {
  name: string;
  githubId: string;
};

export type SplitCourseUsers = {
  usersToInsert: PutUsersDto[];
  usersToUpdate: CourseUser[];
};
