/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CancelablePromise } from '../core/CancelablePromise';
import { request as __request } from '../core/request';

export class CoursesService {

    /**
     * @returns any
     * @throws ApiError
     */
    public static coursesControllerGetCourses(): CancelablePromise<any> {
        return __request({
            method: 'GET',
            path: `/api/v2/courses`,
        });
    }

    /**
     * @param aliasOrId
     * @returns any
     * @throws ApiError
     */
    public static getCourse(
        aliasOrId: string,
    ): CancelablePromise<any> {
        return __request({
            method: 'GET',
            path: `/api/v2/courses/${aliasOrId}`,
        });
    }

}