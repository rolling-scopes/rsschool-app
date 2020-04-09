import { EntityRepository, AbstractRepository, getRepository, In } from 'typeorm';
import { Consent } from '../models';

@EntityRepository(Consent)
export class ConsentRepository extends AbstractRepository<Consent> {
  public findConsentsByChannelValues(channelValues: string[]): Promise<Consent[]> {
    return getRepository(Consent).find({
      where: { channelValue: In(channelValues) },
    });
  }

  public findConsentsByUsernames(usernames: string[]): Promise<Consent[]> {
    return getRepository(Consent).find({
      where: { username: In(usernames) },
    });
  }

  public async saveConsent(consent: Consent) {
    const repository = getRepository(Consent);
    const existingConsent = await this.getConsent(consent.channelValue);
    const consentId = existingConsent?.id;
    if (!consentId) {
      await repository.insert(consent);
    } else {
      await repository.update(consentId, consent);
    }
  }

  private getConsent(channelValue: string): Promise<Consent | undefined> {
    return getRepository(Consent).findOne({ where: { channelValue } });
  }
}
