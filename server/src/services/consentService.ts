import { Consent } from '../models/consent';
import { getRepository, In } from 'typeorm';

export async function captureConsent(consent: Consent) {
  const { channelValue, username = 'null' } = consent;
  consent.username = username;
  const consentRepository = getRepository(Consent);
  const existingConsent = await consentRepository.findOne({ where: { channelValue } });
  const consentId = existingConsent?.id;
  if (!consentId) {
    await consentRepository.insert(consent);
  } else {
    await consentRepository.update(consentId!, consent);
  }
}

export function getConsentsByChannelValues(channelValues: string[]) {
  return getRepository(Consent).find({
    where: { channelValue: In(channelValues) },
  });
}

export function getConsentsByUsernames(usernames: string[]) {
  return getRepository(Consent).find({
    where: { username: In(usernames) },
  });
}
