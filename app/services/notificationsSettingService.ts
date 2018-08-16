import { NotificationsSettingModel } from '../models/notificationsSetting';

export async function getByTelegramId(telegramId: number) {
    const result = await NotificationsSettingModel.findOne({ telegramId }).exec();
    return result;
}

export async function save(data: object) {
    const setting = new NotificationsSettingModel(data);
    const result = await setting.save();

    return result;
}

export async function update(conditions: object, data: object) {
    const result = await NotificationsSettingModel.findOneAndUpdate(conditions, data, { runValidators: true });
    return result;
}
