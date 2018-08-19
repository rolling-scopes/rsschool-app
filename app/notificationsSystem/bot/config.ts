export default {
    knownCommands: new Set(['/start', '/help', '/enable', '/disable', '/settime', '/showsettings']),
    messages: {
        disable: 'Notifications disabled',
        enable: 'Notifications enabled',
        iDontKnowYou: "I can't find you in app. Please, subscribe on me in your profile in rsschool-app",
        iDontUnderstandYou: "Sorry, I don't understand you",
        invalidTimeInterval: 'Sorry, your parameters is invalid. Please, use this format:\nsetTime hh:mm hh:mm',
        subscribe: 'You was subscribed on notifications',
        timeSetted: 'Time was setted',
        welcome: `Hello. I can help you manage notifications. List of available options:
/enable - enable notifications
/disable - disable notifications
/settime - Set time interval when you want to receive notifications. For expample, /settime 12:00 13:00
/chooseevents  - Choose the events that you want to receive notifications on`,
    },
    token: '560576009:AAGAH2VBbKQPrkewz_a_S5jk8e-dA5fQ4ew',
};
