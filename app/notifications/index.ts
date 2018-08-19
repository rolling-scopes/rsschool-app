import axios from 'axios';
import * as schedule from 'node-schedule';
import { UserModel } from '../models';

// by event
const message = {
    name: 'Name',
};
const chatData = {
    chat_id: 0,
    update_id: 0,
    update_id_check: 0,
};
const token = '670305850:AAED_vEV80-jXHmNvudADlfzO-OygiBGnW4';
const urlBot = `https://api.telegram.org/bot`;
const NotificationsType: Array<string> = [
    'typeDeadline',
    'typeScore',
    'typeSessionLecturer',
    'typeSessionStudent',
    'typeStatusMentor',
    'typeStatusStudent',
];

export const runNotificationsSchedule: any = () => {
    schedule.scheduleJob('00 * * * *', () => {
        const type = NotificationsType[1];
        const query1 = { ['profile.notifications.readyToReceive']: 'yes' };
        const query2 = { [`profile.notifications.${type}`]: true };

        UserModel.find({ $and: [query1, query2] })
            .exec()
            .then((usersInfos: Array<any>) => {
                usersInfos.map((userInfo: any) => {
                    axios.get(`${urlBot}${token}/getUpdates?offset={${chatData.update_id}+1}`).then((respons: any) => {
                        if (respons.status === 200) {
                            const currentTime = Date.now();
                            const fromTime = userInfo.profile.notifications.fromTime.split(':');
                            const minTime = new Date().setHours(fromTime[0], fromTime[1]);
                            const toTime = userInfo.profile.notifications.toTime.split(':');
                            const maxTime = new Date().setHours(toTime[0], toTime[1]);
                            if (currentTime > minTime && currentTime < maxTime) {
                                chatData.update_id = respons.data.result.length;
                                chatData.chat_id = respons.data.result[0].message.chat.id;
                                if (chatData.chat_id && chatData.update_id > chatData.update_id_check) {
                                    chatData.update_id_check = chatData.update_id;
                                    axios
                                        .post(
                                            `${urlBot}${token}/sendMessage?chat_id=${chatData.chat_id}
                                &text=${message.name}`,
                                        )
                                        .then((res: object) => {
                                            return res;
                                        })
                                        .catch();
                                }
                            }
                        }
                    });
                });
            })
            .catch();
    });
};
