export * from './course';
export * from './event';

export interface IApiResponse<T> {
    data: T | T[] | null;
}
