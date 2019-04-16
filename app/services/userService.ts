import { User } from '../models-pg';
import { getManager } from 'typeorm';

export async function getUserByGithubId(userId: string) {
    return getManager().findOne(User, { where: { githubId: userId } });
}
