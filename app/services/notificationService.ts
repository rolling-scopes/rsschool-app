import { NotificationModel } from '../models/notification';

export async function save(data: object) {
    const notification = new NotificationModel(data);
    const result = await notification.save();

    return result;
}

export async function remove(id: string) {
    const result = await NotificationModel.findByIdAndRemove(id);
    return result;
}

export async function forEach(cb: any) {
    const cursor = await NotificationModel.find();
    await cursor.forEach(cb);
}
