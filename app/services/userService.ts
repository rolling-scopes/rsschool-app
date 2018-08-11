import { UserModel } from '../models';

export async function getUserById(userId: string) {
    return UserModel.findById(userId).exec();
}

export async function isUserExists(userId: string) {
    const result = await UserModel.findById(userId).exec();
    return !!result;
}

export async function isUserIsMentor(userId: string) {
    const result = await UserModel.findOne({ _id: userId, role: 'mentor' });
    return !!result;
}
