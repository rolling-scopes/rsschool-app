/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CreateDisciplineDto } from '../models/CreateDisciplineDto';
import type { UpdateDisciplineDto } from '../models/UpdateDisciplineDto';
import type { CancelablePromise } from '../core/CancelablePromise';
import { request as __request } from '../core/request';

export class DisciplinesService {

    /**
     * @param requestBody
     * @returns any
     * @throws ApiError
     */
    public static disciplinesControllerCreate(
        requestBody: CreateDisciplineDto,
    ): CancelablePromise<any> {
        return __request({
            method: 'POST',
            path: `/api/v2/disciplines`,
            body: requestBody,
            mediaType: 'application/json',
        });
    }

    /**
     * @returns any
     * @throws ApiError
     */
    public static disciplinesControllerGetAll(): CancelablePromise<any> {
        return __request({
            method: 'GET',
            path: `/api/v2/disciplines`,
        });
    }

    /**
     * @param id
     * @returns any
     * @throws ApiError
     */
    public static disciplinesControllerDelete(
        id: number,
    ): CancelablePromise<any> {
        return __request({
            method: 'DELETE',
            path: `/api/v2/disciplines/${id}`,
        });
    }

    /**
     * @param id
     * @param requestBody
     * @returns any
     * @throws ApiError
     */
    public static disciplinesControllerUpdate(
        id: number,
        requestBody: UpdateDisciplineDto,
    ): CancelablePromise<any> {
        return __request({
            method: 'PATCH',
            path: `/api/v2/disciplines/${id}`,
            body: requestBody,
            mediaType: 'application/json',
        });
    }

}