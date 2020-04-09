import { Consent } from '../models/consent';
import { getCustomRepository } from 'typeorm';
import { ConsentRepository } from '../repositories/consent';

export async function captureConsent(consent: Consent) {
  const { username = 'null' } = consent;
  consent.username = username;
  await getCustomRepository(ConsentRepository).saveConsent(consent);
}
