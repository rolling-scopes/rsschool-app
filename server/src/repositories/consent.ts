import { EntityRepository, AbstractRepository, getRepository, In } from 'typeorm';
import { Consent } from '../models';
import { userService } from '../services';

@EntityRepository(Consent)
export class ConsentRepository extends AbstractRepository<Consent> {
  private findByChannelValues(channelValues: string[]): Promise<Consent[]> {
    return channelValues.length
      ? getRepository(Consent).find({
          where: { channelValue: In(channelValues) },
        })
      : new Promise(res => res([]));
  }

  private findBytgUsernames(usernames: string[]): Promise<Consent[]> {
    return usernames.length
      ? getRepository(Consent).find({
          where: { username: In(usernames) },
        })
      : new Promise(res => res([]));
  }

  public async saveConsents(consents: Consent[]) {
    const chValues = consents.map(consent => consent.channelValue);
    const existingConsents = await this.findByChannelValues(chValues);
    const consentsToSave = consents.map(consent => {
      const [existingConsent] = existingConsents.filter(({ channelValue }) => channelValue === consent.channelValue);
      return existingConsent
        ? {
            ...consent,
            id: consent.id ?? existingConsent.id,
          }
        : consent;
    });
    const repository = getRepository(Consent);
    return repository.save(consentsToSave);
  }

  public async findByGithubIds(githubIds: string[]): Promise<Consent[]> {
    const users = await userService.getUsersByGithubIds(githubIds);
    const emails = users.filter(user => user.contactsEmail).map(user => user.contactsEmail!);
    const tgUsernames = users.filter(user => user.contactsTelegram).map(user => user.contactsTelegram!);
    const emailsConsents = await this.findByChannelValues(emails);
    const tgConsents = await this.findBytgUsernames(tgUsernames);
    return [...emailsConsents, ...tgConsents];
  }
}
