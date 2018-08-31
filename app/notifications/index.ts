import axios from 'axios';
import * as schedule from 'node-schedule';
import { UserModel } from '../models';

// by event
const event = {
    name: 'Event: In Bot we trust',
    score: 100,
    status: 'checked',
    studentName: 'John Dow',
    time: '00:00 23.09.2018',
};

interface IMessages {
    typeDeadline: string;
    typeScore: string;
    typeSessionLecturer: string;
    typeStatusMentor: string;
    typeSessionStudent: string;
    typeStatusStudent: string;
    [key: string]: string;
}

const messages: IMessages = {
    typeDeadline: `Deadline of your task '${event.name}' is ${event.time}`,
    typeScore: `Task '${event.name}': your score is ${event.score}`,
    typeSessionLecturer: `Upcoming session: '${event.name}' at ${event.time}`,
    typeSessionStudent: `Upcoming session: '${event.name}' at ${event.time}`,
    typeStatusMentor: `${event.studentName}: task '${event.name}' is '${event.status}'`,
    typeStatusStudent: `Your task '${event.name}' is '${event.status}'`,
};

const NotificationsType: Array<string> = [
    'typeDeadline',
    'typeScore',
    'typeSessionLecturer',
    'typeSessionStudent',
    'typeStatusMentor',
    'typeStatusStudent',
];

const chatData = {
    chat_id: 0,
    update_id: 0,
    update_id_check: 0,
};

const token = '670305850:AAED_vEV80-jXHmNvudADlfzO-OygiBGnW4';
const urlBot = `https://api.telegram.org/bot`;

export const runNotificationsSchedule: any = () => {
    schedule.scheduleJob('00 * * * *', () => {
        const type = NotificationsType[0];
        const query1 = { ['profile.notifications.readyToReceive']: 'yes' };
        const query2 = { [`profile.notifications.${type}`]: true };

        UserModel.find({ $and: [query1, query2] })
            .exec()
            .then((usersInfos: Array<any>) => {
                usersInfos.map((userInfo: any) => {
                    axios.get(`${urlBot}${token}/getUpdates?offset={${chatData.update_id}+1}`).then((respons: any) => {
                        if (respons.status === 200) {
                            const { fromTime, toTime } = userInfo.profile.notifications;
                            // const {fromTime, toTime, telegramUserName, chatId} = userInfo.profile.notifications;
                            // if (!chatId && respons.data.result) {
                            //     respons.data.result.map((update: any) => {
                            //         console.log(update.message.chat.username);
                            //         console.log(update.message.chat.id);
                            //         console.log(userInfo._id);
                            //         console.log(telegramUserName);
                            //
                            //         // UserModel.update({'_id': userInfo._id},
                            //         //     {$set: {'profile.notifications.chatId': update.message.chat.id}});
                            //     });
                            //

                            chatData.chat_id = respons.data.result[0].message.chat.id;

                            chatData.update_id = respons.data.result.length;

                            if (chatData.chat_id && chatData.update_id > chatData.update_id_check) {
                                chatData.update_id_check = chatData.update_id;
                            }

                            if (isTime(fromTime, toTime)) {
                                const message = messages[`${type}`];
                                axios
                                    .post(
                                        `${urlBot}${token}/sendMessage?chat_id=${chatData.chat_id}
                                &text=${message}`,
                                    )
                                    .then((res: object) => {
                                        return res;
                                    })
                                    .catch();
                            }
                        }
                        // else {
                        // }
                    });
                });
            })
            .catch();
    });
};

function isTime(fromTimeString: string, toTimeString: string) {
    const currentTime = Date.now();
    const fromTime = fromTimeString.split(':');
    const toTime = toTimeString.split(':');
    const minTime = new Date().setHours(Number(fromTime[0]), Number(fromTime[1]));
    const maxTimeCheck = new Date().setHours(Number(toTime[0]), Number(toTime[1]));
    const maxTime =
        minTime < maxTimeCheck ? maxTimeCheck : new Date().setHours(Number(toTime[0]) + 24, Number(toTime[1]));
    return currentTime > minTime && currentTime < maxTime;
}
