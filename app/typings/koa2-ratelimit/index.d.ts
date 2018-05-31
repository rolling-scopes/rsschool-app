declare module 'koa2-ratelimit' {
    import * as Koa from 'koa';
    interface Props {
        interval: { min?: number; hour?: number }; // 15 minutes = 15*60*1000
        max: number;
        message?: string;
        prefixKey?: string;
        getUserId?: (ctx: Koa.Context) => Promise<string>;
    }
    export namespace RateLimit {
        function middleware(options: Props): Koa.Middleware;
    }
}
