import { INotificationsSetting, NotificationsSettingModel } from '../models/notificationsSetting';

export async function getByTelegramId(telegramId: number) {
    const result = await NotificationsSettingModel.findOne({ telegramId }).exec();
    return result;
}

export async function save(data: object) {
    const setting = new NotificationsSettingModel(data);
    const result = await setting.save();

    return result;
}

export async function updateById(id: string, data: object): Promise<INotificationsSetting | null> {
    const result = await NotificationsSettingModel.findByIdAndUpdate(id, data, { new: true, runValidators: true });
    return result;
}

export async function find(data?: object): Promise<INotificationsSetting[]> {
    const result = await NotificationsSettingModel.find(data);
    return result;
}
