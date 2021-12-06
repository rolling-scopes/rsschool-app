/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CreateAlertDto } from '../models/CreateAlertDto';
import type { UpdateAlertDto } from '../models/UpdateAlertDto';
import type { CancelablePromise } from '../core/CancelablePromise';
import { request as __request } from '../core/request';

export class AlertsService {

    /**
     * @param requestBody
     * @returns any
     * @throws ApiError
     */
    public static alertsControllerCreate(
        requestBody: CreateAlertDto,
    ): CancelablePromise<any> {
        return __request({
            method: 'POST',
            path: `/api/v2/alerts`,
            body: requestBody,
            mediaType: 'application/json',
        });
    }

    /**
     * @param enabled
     * @returns any
     * @throws ApiError
     */
    public static alertsControllerGetAll(
        enabled: boolean,
    ): CancelablePromise<any> {
        return __request({
            method: 'GET',
            path: `/api/v2/alerts`,
            query: {
                'enabled': enabled,
            },
        });
    }

    /**
     * @param id
     * @param requestBody
     * @returns any
     * @throws ApiError
     */
    public static alertsControllerUpdate(
        id: number,
        requestBody: UpdateAlertDto,
    ): CancelablePromise<any> {
        return __request({
            method: 'PATCH',
            path: `/api/v2/alerts/${id}`,
            body: requestBody,
            mediaType: 'application/json',
        });
    }

    /**
     * @param id
     * @returns any
     * @throws ApiError
     */
    public static alertsControllerRemove(
        id: number,
    ): CancelablePromise<any> {
        return __request({
            method: 'DELETE',
            path: `/api/v2/alerts/${id}`,
        });
    }

}