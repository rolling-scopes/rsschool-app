import csv from 'csvtojson';
import { CSSProperties } from 'react';
import { UploadChangeParam } from 'antd/lib/upload';
import isUndefined from 'lodash/isUndefined';
import { DEFAULT_COLOR, SPECIAL_TASK_TYPES } from 'components/Schedule/constants';
import { CourseService, CourseEvent, CourseTaskDetails, CourseTask } from 'services/course';

export const getEventLink = (courseAlias: string, eventId: number, isTask?: boolean) =>
  `/course/event?course=${courseAlias}&type=${isTask ? 'task' : 'event'}&id=${eventId}`;

export const getTagStyle = (tagName: string, tagColors: Record<string, string> = {}, styles?: CSSProperties) => {
  const tagColor = tagColors[tagName] || DEFAULT_COLOR;
  return {
    ...styles,
    borderColor: tagColor,
    color: tagColor,
    backgroundColor: `${tagColor}10`,
  };
};

const createCourseEventFromTask = (task: CourseTaskDetails, type: string): CourseEvent =>
  ({
    id: task.id,
    dateTime: (type === SPECIAL_TASK_TYPES.deadline ? task.studentEndDate : task.studentStartDate) || '',
    event: {
      type: type,
      name: task.name,
      descriptionUrl: task.descriptionUrl,
      id: task.taskId,
    },
    organizer: {
      githubId: task.taskOwner ? task.taskOwner.githubId : '',
    },
    isTask: true,
    special: task.special,
    duration: task.duration,
    score: `${task.score ?? 0}/${task.maxScore}`,
    done: task.score && task.maxScore ? Math.round((task.score / task.maxScore) * 100) : 0,
  } as CourseEvent);

export const transformTasksToEvents = (tasks: CourseTaskDetails[]) =>
  tasks.reduce((acc: Array<CourseEvent>, task: CourseTaskDetails) => {
    if (task.type !== SPECIAL_TASK_TYPES.test) {
      acc.push(createCourseEventFromTask(task, task.type));
    }
    acc.push(
      createCourseEventFromTask(
        task,
        task.type === SPECIAL_TASK_TYPES.test ? SPECIAL_TASK_TYPES.test : SPECIAL_TASK_TYPES.deadline,
      ),
    );
    return acc;
  }, []);

interface CsvItem {
  id: string;
  entityType: string;
  templateId: string;
  startDate: string;
  endDate: string;
  type: string;
  special: string;
  name: string;
  descriptionUrl: string;
  githubId: string;
  place: string;
  checker: string;
  pairsCount: string;
}

export const parseFiles = async ({ fileList }: UploadChangeParam) => {
  const filesContent: string[] = await Promise.all(
    fileList.map(
      file =>
        new Promise((res: (value: string) => void, rej) => {
          const reader = new FileReader();
          reader.readAsText(file.originFileObj as Blob, 'utf-8');
          reader.onload = ({ target }) => {
            res(target?.result?.toString() ?? '');
          };
          reader.onerror = e => rej(e);
        }),
    ),
  );

  const entities = (await Promise.all(filesContent.map((content: string) => csv().fromString(content))))
    .reduce((acc, cur) => acc.concat(cur), [])
    .map((item: CsvItem) => {
      if (isUndefined(item.entityType)) {
        throw new Error('Incorrect data: CSV file should content the headers named "entityType"');
      }
      return item;
    });

  return entities;
};

export const uploadResults = (
  courseService: CourseService,
  data: {
    entityType: string;
    id: string;
    startDate: string;
    endDate: string;
    type: string;
    special: string;
    name: string;
    descriptionUrl: string;
    githubId: string;
    place: string;
  }[],
  timeZone: string,
) => courseService.postMultipleEntities(data as Partial<CourseEvent & CourseTask>, timeZone);
