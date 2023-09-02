import { TaskDto } from 'api';
import { NEW_API_TASK_TYPES } from 'data/taskTypes';

export const COURSE_NAME_MOCK = 'RS2023';

export function generateTasksData(count = 3): TaskDto[] {
  const data = new Array(count).fill({}).map((_, i) => {
    const taskType = NEW_API_TASK_TYPES[i].id;
    const task: TaskDto = {
      discipline: { name: 'JS', id: 0 },
      id: i,
      name: `${taskType}-${i}`,
      description: `Something_${i}`,
      descriptionUrl: `http://exemple.com/link-${i}`,
      githubPrRequired: !!i,
      type: taskType,
      githubRepoName: 'Repo',
      sourceGithubRepoUrl: 'http://exemple2.com',
      createdDate: new Date().toISOString(),
      updatedDate: new Date().toISOString(),
      tags: ['tag_1', 'tag_2'],
      skills: ['skill_1', 'skill_2'],
      attributes: {},
      courses: !i ? [{ name: COURSE_NAME_MOCK, isActive: true }] : [],
    };

    return task;
  });

  return data;
}
