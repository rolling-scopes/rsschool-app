import { UserDocument } from '../models';

export async function getUserById(userId: string) {
    return UserDocument.findById(userId).exec();
}
