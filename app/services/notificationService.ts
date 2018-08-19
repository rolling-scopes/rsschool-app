import { NotificationModel } from '../models/notification';

export async function save(data: object) {
    const notification = new NotificationModel(data);
    const result = await notification.save();

    return result;
}

export async function removeById(id: string) {
    const result = await NotificationModel.findByIdAndRemove(id);
    return result;
}

export async function removeByEvent(eventType: string, eventId: string) {
    const removed = await NotificationModel.find({ eventType, eventId })
        .select('id')
        .exec();
    await NotificationModel.remove({ eventType, eventId });

    return removed.map(({ _id }) => _id);
}

export async function forEach(cb: any) {
    const cursor = await NotificationModel.find();
    await cursor.forEach(cb);
}
