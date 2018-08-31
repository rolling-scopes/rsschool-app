import { INotification, NotificationModel } from '../models/notification';

export async function save(data: object) {
    const notification = new NotificationModel(data);
    const result = await notification.save();

    return result;
}

export async function removeById(id: string) {
    const result = await NotificationModel.findByIdAndRemove(id);
    return result;
}

export async function removeByEvent(eventType: string, eventId: string): Promise<string[]> {
    const removed = await NotificationModel.find({ eventType, eventId }).select('id');

    await NotificationModel.remove({ eventType, eventId });

    return removed.map(({ _id }) => _id);
}

export async function removeOverdue() {
    const currentTime = Date.now();
    const result = await NotificationModel.find()
        .where('dateTime')
        .lt(currentTime)
        .remove();

    return result;
}

export async function find(data?: object): Promise<INotification[]> {
    const result = await NotificationModel.find(data);
    return result;
}
