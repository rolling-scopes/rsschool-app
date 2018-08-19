import * as passport from 'koa-passport';
import { INTERNAL_SERVER_ERROR } from 'http-status-codes';
import { userInfo, hostname } from 'os';
import * as Router from 'koa-router';
import { config } from '../../config';
import { createUser } from '../../rules';

export const devAuthMiddleware = async (ctx: Router.IRouterContext) => {
    try {
        const userSession = await createUser(
            {
                username: `${userInfo().username}@${hostname()}`,
            },
            config.roles.adminTeams,
            // config.roles.mentorTeams,
            // [],
        );

        // inject dev user into passport's session
        const key = (passport as any)._key;
        ctx.session![key] = {
            user: userSession,
        };
        ctx.redirect(config.auth.successRedirect);
    } catch (err) {
        ctx.status = INTERNAL_SERVER_ERROR;
    }
};
