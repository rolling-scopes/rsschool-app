/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ProfileCourseDto } from '../models/ProfileCourseDto';
import type { CancelablePromise } from '../core/CancelablePromise';
import { request as __request } from '../core/request';

export class ProfileService {

    /**
     * @param username
     * @returns ProfileCourseDto
     * @throws ApiError
     */
    public static getCourses(
        username: string,
    ): CancelablePromise<Array<ProfileCourseDto>> {
        return __request({
            method: 'GET',
            path: `/api/v2/profile/${username}/courses`,
        });
    }

}