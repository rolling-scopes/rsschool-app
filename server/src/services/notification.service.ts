import axios, { AxiosError } from 'axios';
import { config } from '../config';
import { Consent, ChannelType, CourseTask } from '../models';
import { courseService } from '.';
import { ConsentRepository } from '../repositories/consent';
import { getCustomRepository } from 'typeorm';

export async function renderMentorConfirmationText(preselectedCourseIds: number[]) {
  const preselectedCourseIdsSet = new Set(preselectedCourseIds);
  const courses = await courseService.getCourses();
  const preselectedCourses = courses.filter(course => preselectedCourseIdsSet.has(course.id));
  const names = preselectedCourses.map(course => course.name).join(', ');
  const confirmLinks = preselectedCourses
    .map(({ alias, name }) => `${name}: https://app.rs.school/course/mentor/confirm?course=${alias}`)
    .join('\n');
  const mentorChatLinks = preselectedCourses
    .map(({ discordServer, name }) => `${name}: ${discordServer.mentorsChatUrl}`)
    .join('\n');
  return `Your participation as mentor in RSS course has been approved.\nCourse(s): ${names}.\nTo confirm the assignment for the course, click on the link(s):\n${confirmLinks}\nCome into mentor's chat(s):\n${mentorChatLinks}`;
}

export async function renderTaskResultText(courseTask: CourseTask, score: number) {
  const { maxScore, scoreWeight, checker } = courseTask;
  return `Your task has been reviewed by ${checker}.\nResult: ${score}/${maxScore}\nThe weight of this task = ${scoreWeight}.\nGood luck in further training!`;
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

type ChannelValues = {
  emails: string[];
  chatIds: string[];
};

function getChValues(consents: Consent[], isIgnoreConsents: boolean) {
  return consents.reduce(
    (chValues: ChannelValues, consent) => {
      const { channelType, channelValue, optIn } = consent;
      if (isIgnoreConsents || optIn) {
        switch (channelType) {
          case 'tg':
            chValues.chatIds.push(channelValue);
            break;
          default:
            chValues.emails.push(channelValue);
        }
      }
      return chValues;
    },
    {
      emails: [],
      chatIds: [],
    },
  );
}

export async function sendNotification(githubIds: string[], text: string, isIgnoreConsents: boolean = false) {
  try {
    if (config.isDevMode) {
      return;
    }
    const consentRepository = getCustomRepository(ConsentRepository);
    const consents = await consentRepository.findByGithubIds(githubIds);
    const { emails, chatIds } = getChValues(consents, isIgnoreConsents);
    sendEmailNotification(emails, text);
    sendTgNotification(chatIds, text);
  } catch (err) {
    const error = err as AxiosError;
    throw error.response?.data ?? error.message;
  }
}
