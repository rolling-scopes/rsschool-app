import { consentService } from './';
import { userService } from './';
import axios, { AxiosError } from 'axios';
import { config } from '../config';
import { Consent, User } from '../models';

export type Notification = {
  text: string;
  to: number[] | string[];
  channelType: 'tg' | 'email';
  from?: string;
  course?: {
    id?: number;
    name: string;
  };
};

function postNotification(notification: Notification) {
  axios.post(`${config.aws.restApiUrl}/notification`, notification, {
    headers: { 'x-api-key': config.aws.restApiKey },
  });
}

function sendTgNotification(consents: Consent[], text: string) {
  const chatIdsForTgNotification = consents.filter(consent => consent.tg).map(consent => consent.chatId);
  if (chatIdsForTgNotification.length) {
    postNotification({
      text,
      to: chatIdsForTgNotification,
      channelType: 'tg',
    });
  }
}

function sendEmailNotification(consents: Consent[], users: User[], text: string) {
  const usernamesSetForEmailNotification = new Set(
    consents.filter(consent => consent.email).map(consent => consent.username),
  );
  const emailsToSend = users
    .filter(user => (user.contactsEmail ? usernamesSetForEmailNotification.has(user.contactsEmail) : false))
    .map(user => user.contactsEmail!);

  if (emailsToSend.length) {
    postNotification({
      text,
      to: emailsToSend,
      channelType: 'email',
    });
  }
}

export async function sendNotification(userIds: number[], text: string) {
  try {
    if (config.isDevMode) {
      return;
    }
    const users = (await userService.getUsersByIds(userIds)) || [];
    const usersWithFilledTgUsername = users.filter(user => user.contactsTelegram);
    const tgUsernames = usersWithFilledTgUsername.map(user => user.contactsTelegram!);
    if (!tgUsernames.length) {
      return;
    }
    const consents = await consentService.getConsentsByTgUsernames(tgUsernames);
    sendTgNotification(consents, text);
    sendEmailNotification(consents, usersWithFilledTgUsername, text);
  } catch (err) {
    const error = err as AxiosError;
    throw error.response?.data ?? error.message;
  }
}
