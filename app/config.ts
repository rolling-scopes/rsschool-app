export interface IConfig {
    auth: {
        callback: string;
        github_client_id: string;
        github_client_secret: string;
        successRedirect: string;
    };
    rateLimit: {
        intervalMin: number;
        max: number;
    };
    roles: {
        mentorTeams: string[];
        adminTeams: string[];
    };
    isDevMode: boolean;
    mongo: {
        connectAttempts: number;
        connectionString: string;
        options: {
            auth:
                | {
                      password: string;
                      user: string;
                  }
                | undefined;
            dbName: string;
            keepAlive: number;
        };
        reconnectDelayMs: number;
    };
    port: number;
    name: string;
    sessionKey: string;
}

const mongoUser = process.env.RSSHCOOL_API_MONGO_USER || undefined;
const mongoPassword = process.env.RSSHCOOL_API_MONGO_PASSWORD || undefined;

export const config: IConfig = {
    auth: {
        callback: process.env.RSSHCOOL_API_AUTH_CALLBACK || 'http://localhost:3001/auth/github/callback',
        github_client_id: process.env.RSSHCOOL_API_AUTH_CLIENT_ID || 'client-id',
        github_client_secret: process.env.RSSHCOOL_API_AUTH_CLIENT_SECRET || 'client-secret',
        successRedirect: process.env.RSSHCOOL_API_AUTH_SUCCESS_REDIRECT || 'http://localhost:3001',
    },
    roles: {
        adminTeams: ['rsschool-dev-team@rolling-scopes'],
        mentorTeams: ['rsschool-dev-team@rolling-scopes'],
    },

    isDevMode: process.env.NODE_ENV !== 'production',
    mongo: {
        connectAttempts: 5,
        connectionString: process.env.RSSHCOOL_API_MONGO_CONNECTION_STRING1 || 'mongodb://localhost:27017',
        options: {
            auth:
                mongoUser != null && mongoPassword != null
                    ? {
                          password: mongoPassword,
                          user: mongoUser,
                      }
                    : undefined,
            dbName: process.env.RSSHCOOL_API_MONGO_DBNAME1 || 'rsschool',
            keepAlive: 1,
        },
        reconnectDelayMs: 5000,
    },
    name: 'rsschool-api',
    port: parseInt(process.env.NODE_PORT || '3000', 10),
    rateLimit: {
        intervalMin: 5,
        max: 100,
    },
    sessionKey: process.env.RSSHCOOL_API_SESSION_KEY || 'secret-session-key',
};
