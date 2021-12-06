/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { MentorStudentDto } from '../models/MentorStudentDto';
import type { CancelablePromise } from '../core/CancelablePromise';
import { request as __request } from '../core/request';

export class MentorsService {

    /**
     * @param mentorId
     * @returns MentorStudentDto
     * @throws ApiError
     */
    public static getStudents(
        mentorId: number,
    ): CancelablePromise<Array<MentorStudentDto>> {
        return __request({
            method: 'GET',
            path: `/api/v2/mentors/${mentorId}/students`,
        });
    }

}