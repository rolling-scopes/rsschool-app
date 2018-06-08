import { UserModel } from '../models';

export async function getUserById(userId: string) {
    return UserModel.findById(userId).exec();
}
