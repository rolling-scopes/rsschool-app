/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CreateStudentFeedbackDto } from '../models/CreateStudentFeedbackDto';
import type { StudentFeedbackDto } from '../models/StudentFeedbackDto';
import type { UpdateStudentFeedbackDto } from '../models/UpdateStudentFeedbackDto';
import type { CancelablePromise } from '../core/CancelablePromise';
import { request as __request } from '../core/request';

export class StudentsFeedbacksService {

    /**
     * @param studentId
     * @param requestBody
     * @returns StudentFeedbackDto
     * @throws ApiError
     */
    public static createStudentFeedback(
        studentId: number,
        requestBody: CreateStudentFeedbackDto,
    ): CancelablePromise<StudentFeedbackDto> {
        return __request({
            method: 'POST',
            path: `/api/v2/students/${studentId}/feedbacks`,
            body: requestBody,
            mediaType: 'application/json',
        });
    }

    /**
     * @param studentId
     * @param id
     * @param requestBody
     * @returns any
     * @throws ApiError
     */
    public static feedbacksControllerUpdateStudentFeedback(
        studentId: number,
        id: number,
        requestBody: UpdateStudentFeedbackDto,
    ): CancelablePromise<any> {
        return __request({
            method: 'PATCH',
            path: `/api/v2/students/${studentId}/feedbacks/${id}`,
            body: requestBody,
            mediaType: 'application/json',
        });
    }

    /**
     * @param studentId
     * @param id
     * @returns StudentFeedbackDto
     * @throws ApiError
     */
    public static feedbacksControllerGetStudentFeedback(
        studentId: number,
        id: number,
    ): CancelablePromise<StudentFeedbackDto> {
        return __request({
            method: 'GET',
            path: `/api/v2/students/${studentId}/feedbacks/${id}`,
        });
    }

}