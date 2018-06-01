export * from './course';
export * from './event';
export * from './user';
export * from './participation';
export * from './feed';
export * from './feedActions';

export interface IApiResponse<T> {
    data: T | T[] | null;
}
