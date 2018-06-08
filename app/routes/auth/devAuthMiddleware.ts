import * as passport from 'koa-passport';
import { userInfo, hostname } from 'os';
import * as Router from 'koa-router';
import { config } from '../../config';
import { createUser } from '../../rules';

export const devAuthMiddleware = async (ctx: Router.IRouterContext) => {
    const userSession = await createUser(
        {
            username: `${userInfo().username}@${hostname()}`,
        },
        config.roles.adminTeams,
    );

    // inject dev user into passport's session
    const key = (passport as any)._key;
    ctx.session![key] = {
        user: userSession,
    };
    ctx.redirect(config.auth.successRedirect);
};
