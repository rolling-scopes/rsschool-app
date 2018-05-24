export * from './course';
export * from './event';
export * from './user';

export interface IApiResponse<T> {
    data: T | T[] | null;
}
