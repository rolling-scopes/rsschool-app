export * from './course';
export * from './event';
export * from './stage';
export * from './user';
export * from './courseStudent';
export * from './courseMentor';
export * from './feed';
export * from './feedActions';
export * from './assignments';

export interface IApiResponse<T> {
    data: T | T[] | null;
}
