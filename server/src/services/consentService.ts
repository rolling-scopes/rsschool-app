import { Consent } from '../models/consent';
import { getRepository } from 'typeorm';

export async function captureConsent({ chatId, username, tg, email }: Consent) {
  const consentRepository = getRepository(Consent);
  const existingConsent = await consentRepository.findOne({ where: { chatId } });
  const consentId = existingConsent?.id;
  if (!consentId) {
    await consentRepository.insert({
      chatId,
      username,
      tg: !!tg,
      email: !!email,
    });
  } else {
    await consentRepository.update(consentId!, {
      chatId,
      username,
      tg: tg === false || tg ? tg : existingConsent!.tg,
      email: email === false || email ? email : existingConsent!.email,
    });
  }
}
