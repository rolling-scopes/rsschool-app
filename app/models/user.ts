export interface IUser {
    id: string;
    roles: Array<'admin' | 'mentor' | 'student'>;
}
