export interface IConfig {
    mongo: {
        connectionString: string;
    };
    port: number;
}

export const config: IConfig = {
    mongo: {
        connectionString: process.env.MONGO_CONNECTION_STRING || 'mongodb://localhost:27017/rsschool',
    },
    port: parseInt(process.env.NODE_PORT || '3000', 10),
};
