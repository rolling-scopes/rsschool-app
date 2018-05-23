export interface IConfig {
    mongo: {
        connectAttempts: number;
        connectionString: string;
        options: {
            auth: {
                password: string;
                user: string;
            };
            dbName: string;
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
        connectionString: process.env.RSSHCOOL_API_MONGO_CONNECTION_STRING || 'mongodb://mongodb:27017',
        options: {
            auth: {
                password: process.env.RSSHCOOL_API_MONGO_PASSWORD || '',
                user: process.env.RSSHCOOL_API_MONGO_USER || '',
            },
            dbName: 'rsschool',
            keepAlive: 1,
        },
        reconnectDelayMs: 5000,
    },
    name: 'rsschool-api',
    port: parseInt(process.env.NODE_PORT || '3000', 10),
};
