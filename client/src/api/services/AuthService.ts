/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CancelablePromise } from '../core/CancelablePromise';
import { request as __request } from '../core/request';

export class AuthService {

    /**
     * @returns any
     * @throws ApiError
     */
    public static authControllerGithubLogin(): CancelablePromise<any> {
        return __request({
            method: 'GET',
            path: `/api/v2/auth/github/login`,
        });
    }

    /**
     * @returns any
     * @throws ApiError
     */
    public static authControllerGithubCallback(): CancelablePromise<any> {
        return __request({
            method: 'GET',
            path: `/api/v2/auth/github/callback`,
        });
    }

}