import { INotificationsSettingModel, NotificationsSettingModel } from '../models/notificationsSetting';

export async function getByTelegramId(telegramId: number) {
    const result = await NotificationsSettingModel.findOne({ telegramId }).populate('user');
    return result;
}

export async function save(data: object) {
    const setting = new NotificationsSettingModel(data);
    const result = await setting.save();

    return result;
}

export async function updateById(id: string, data: object): Promise<INotificationsSettingModel | null> {
    const result = await NotificationsSettingModel.findByIdAndUpdate(id, data, { new: true, runValidators: true });
    return result;
}

export async function find(data?: object): Promise<INotificationsSettingModel[]> {
    const result = await NotificationsSettingModel.find(data);
    return result;
}

export async function findByCoureId(courseId: string, data?: object) {
    const result = await NotificationsSettingModel.find(data).populate('user');

    return result.filter((setting: INotificationsSettingModel) => {
        if (typeof setting.user === 'object') {
            return setting.user.participations.some(item => item.isActive && item.courseId === courseId);
        }
    });
}
