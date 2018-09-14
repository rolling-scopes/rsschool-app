import { UserModel, Roles } from '../models';

export async function getUserById(userId: string) {
    return UserModel.findById(userId).exec();
}

export async function getBunchUsers(userIds: string[], role: Roles) {
    return UserModel.find({ _id: { $in: userIds } }, role).exec();
}
