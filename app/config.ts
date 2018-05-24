export interface IConfig {
    auth: {
        callback: string;
        github_client_id: string;
        github_client_secret: string;
        successRedirect: string;
    };
    isDevMode: boolean;
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
    sessionKey: string;
}

export const config: IConfig = {
    auth: {
        callback: process.env.RSSHCOOL_API_AUTH_CALLBACK || 'http://localhost:3000/auth/github/callback',
        github_client_id: process.env.RSSHCOOL_API_AUTH_CLIENT_ID || 'client-id',
        github_client_secret: process.env.RSSHCOOL_API_AUTH_CLIENT_SECRET || 'client-secret',
        successRedirect: process.env.RSSHCOOL_API_AUTH_SUCCESS_REDIRECT || 'http://localhost:3001',
    },
    isDevMode: process.env.NODE_ENV !== 'production',
    mongo: {
        connectAttempts: 5,
        connectionString: process.env.RSSHCOOL_API_MONGO_CONNECTION_STRING || 'mongodb://mongodb:27017',
        options: {
            auth: {
                password: process.env.RSSHCOOL_API_MONGO_PASSWORD || '',
                user: process.env.RSSHCOOL_API_MONGO_USER || '',
            },
            dbName: process.env.RSSHCOOL_API_MONGO_DBNAME || 'rsschool',
            keepAlive: 1,
        },
        reconnectDelayMs: 5000,
    },
    name: 'rsschool-api',
    port: parseInt(process.env.NODE_PORT || '3000', 10),
    sessionKey: process.env.RSSHCOOL_API_SESSION_KEY || '',
};
