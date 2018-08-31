export interface IConfig {
    knownCommands: string[];
    messages: {
        disable: string;
        enable: string;
        iDontKnowYou: string;
        iDontUnderstandYou: string;
        invalidTimeInterval: string;
        subscribe: string;
        timeSetted: string;
        welcome: string;
    };
    token: string;
}

export const config: IConfig = {
    knownCommands: ['/start', '/help', '/enable', '/disable', '/settime'],
    messages: {
        disable: 'Notifications was disabled',
        enable: 'Notifications was enabled',
        iDontKnowYou: "I can't find you in app. Please, subscribe to me in your profile in rsschool-app",
        iDontUnderstandYou: "Sorry, I don't understand you",
        invalidTimeInterval: 'Sorry, your parameters is invalid. Please, use this format:\n/setTime hh:mm hh:mm',
        subscribe: 'You was subscribed to notifications',
        timeSetted: 'Time was setted',
        welcome: `Hello. I can help you manage notifications. List of available options:
/enable - enable notifications
/disable - disable notifications
/settime - Set time interval when you want to receive notifications. For expample, /settime 12:00 13:00`,
    },
    token: '560576009:AAGAH2VBbKQPrkewz_a_S5jk8e-dA5fQ4ew',
};
