import { consentService } from './';
import { userService } from './';
import axios, { AxiosError } from 'axios';
import { config } from '../config';
import { Consent, ChannelType } from '../models';
import { courseService } from '../services';

export async function renderMentorConfirmationText(preselectedCourseIds: number[]) {
  const preselectedCourseIdsSet = new Set(preselectedCourseIds);
  const courses = await courseService.getCourses();
  const preselectedCourses = courses.filter(course => preselectedCourseIdsSet.has(course.id));
  const names = preselectedCourses.map(course => course.name).join(', ');
  const confirmLinks = preselectedCourses
    .map(({ alias }) => `https://app.rs.school/course/mentor/confirm?course=${alias}`)
    .join('\n');
  return `Your partisipation as mentor in RSS course has been approved.\nCourse(s): ${names}.\nTo confirm the assignment for the course, click on the link(s): ${confirmLinks}`;
}

export type Notification = {
  text: string;
  to: string[];
  channelType: ChannelType;
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

function sendTgNotification(chatIds: string[], text: string) {
  if (chatIds.length) {
    postNotification({
      text,
      to: chatIds,
      channelType: 'tg',
    });
  }
}

function sendEmailNotification(emails: string[], text: string) {
  if (emails.length) {
    postNotification({
      text,
      to: emails,
      channelType: 'email',
    });
  }
}

function getConsonantsChValues(consents: Consent[]) {
  return consents.filter(consent => consent.optIn).map(consent => consent.channelValue);
}

type UsersContacts = {
  emails: string[];
  tgUsernames: string[];
};

export async function sendNotification(userIds: number[], text: string, isIgnoreConsents: boolean = false) {
  try {
    if (config.isDevMode) {
      return;
    }
    const users = (await userService.getUsersByIds(userIds)) || [];
    const { emails, tgUsernames } = users.reduce(
      (chValues: UsersContacts, user) => {
        const { contactsEmail, contactsTelegram } = user;
        if (contactsEmail) {
          chValues.emails.push(contactsEmail);
        }
        if (contactsTelegram) {
          chValues.tgUsernames.push(contactsTelegram);
        }
        return chValues;
      },
      {
        emails: [],
        tgUsernames: [],
      },
    );
    const tgConsents = await consentService.getConsentsByUsernames(tgUsernames);
    if (isIgnoreConsents) {
      sendEmailNotification(emails, text);
      const chatIds = tgConsents.map(consent => consent.channelValue);
      sendTgNotification(chatIds, text);
    } else {
      const emailConsents = await consentService.getConsentsByChannelValues(emails);
      const consonantsEmails = getConsonantsChValues(emailConsents);
      const consonantsChatIds = getConsonantsChValues(tgConsents);
      sendEmailNotification(consonantsEmails, text);
      sendTgNotification(consonantsChatIds, text);
    }
  } catch (err) {
    const error = err as AxiosError;
    throw error.response?.data ?? error.message;
  }
}
