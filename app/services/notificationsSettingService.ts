import { INotificationsSettingModel, NotificationsSettingModel } from '../models/notificationsSetting';
import { CourseMentorModel } from '../models/courseMentor';
import { CourseStudentModel } from '../models/courseStudent';

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
    // there is field user.participation with information about courses, but it isn't generated
    // return setting.user.participations.some(item => item.isActive && item.courseId === courseId);
    // return await result.filter(
    //     setting => typeof(setting.user) === 'object' &&
    //         setting.user.participations.some(item => item.isActive && item.courseId === courseId)
    // );

    return result.reduce(async (acc: Promise<INotificationsSettingModel[]>, setting: INotificationsSettingModel) => {
        const settings = await acc;
        if (typeof setting.user !== 'object') {
            return acc;
        }

        let model: any;
        switch (setting.user.role) {
            case 'student':
                model = CourseStudentModel;
                break;
            case 'mentor':
                model = CourseMentorModel;
                break;
            default:
                return acc;
        }

        const courseUser = await model.findOne({ userId: setting.user._id, courseId, isActive: true });

        return courseUser ? [...settings, setting] : settings;
    }, Promise.resolve([]));
}
