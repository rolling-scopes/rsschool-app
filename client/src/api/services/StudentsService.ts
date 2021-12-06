/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { StudentDto } from '../models/StudentDto';
import type { CancelablePromise } from '../core/CancelablePromise';
import { request as __request } from '../core/request';

export class StudentsService {

    /**
     * @param studentId
     * @returns StudentDto
     * @throws ApiError
     */
    public static getStudent(
        studentId: number,
    ): CancelablePromise<StudentDto> {
        return __request({
            method: 'GET',
            path: `/api/v2/students/${studentId}`,
        });
    }

}