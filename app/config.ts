export interface IConfig {
    mongo: {
        connectAttempts: number;
        connectionString: string;
        options: {
            keepAlive: number;
        };
        reconnectDelayMs: number;
    };
    port: number;
    name: string;
}

export const config: IConfig = {
    mongo: {
        connectAttempts: 5,
        connectionString: process.env.MONGO_CONNECTION_STRING || 'mongodb://mongodb:27017/rsschool',
        options: {
            keepAlive: 1,
        },
        reconnectDelayMs: 5000,
    },
    name: 'rsschool-api',
    port: parseInt(process.env.NODE_PORT || '3000', 10),
};
