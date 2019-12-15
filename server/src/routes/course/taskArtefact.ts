import Router from 'koa-router';
import { getRepository } from 'typeorm';
import { OK, BAD_REQUEST } from 'http-status-codes';

import { setResponse } from '../utils';
import { Student, Task, User, TaskArtefact } from '../../models';
import { ILogger } from '../../logger';
import { taskService, taskResultsService } from '../../services';

type Input = {
  studentId: number | string;
  comment?: string;
  videoUrl?: string;
  presentationUrl?: string;
};

export const postTaskArtefact = (_: ILogger) => async (ctx: Router.RouterContext) => {
  const courseTaskId: number = ctx.params.courseTaskId;

  const authorId = ctx.state.user.id;
  const courseTask = await taskService.getCourseTask(courseTaskId);
  if (courseTask == null) {
    setResponse(ctx, BAD_REQUEST, { message: 'not valid course task' });
    return;
  }

  const inputData: Input = ctx.request.body;
  const data = {
    courseTaskId: courseTask.id,
    studentId: Number(inputData.studentId),
    comment: inputData.comment || '',
    videoUrl: inputData.videoUrl,
    presentationUrl: inputData.presentationUrl,
  };

  const student = await getRepository(Student).findOne(data.studentId, { relations: ['user'] });
  if (student == null) {
    setResponse(ctx, BAD_REQUEST, { message: 'not valid student' });
    return;
  }

  const { studentId } = data;
  const task = courseTask.task as Task;

  if (!task.allowStudentArtefacts) {
    setResponse(ctx, BAD_REQUEST, { message: 'does not allow to student submit' });
    return;
  }
  if (authorId === (student.user as User).id) {
    const existingResult = await taskResultsService.getStudentTaskArtefact(studentId, courseTaskId);
    if (existingResult == null) {
      const taskArtefact = taskResultsService.createStudentArtefactTaskResult(data);
      const addResult = await getRepository(TaskArtefact).insert(taskArtefact);
      setResponse(ctx, OK, addResult);
      return;
    }
    if (data.videoUrl) {
      existingResult.videoUrl = data.videoUrl;
    }
    if (data.presentationUrl) {
      existingResult.presentationUrl = data.presentationUrl;
    }
    const updateResult = await getRepository(TaskArtefact).update(existingResult.id, {
      videoUrl: data.videoUrl,
      presentationUrl: data.presentationUrl,
      comment: data.comment || existingResult.comment,
    });
    setResponse(ctx, OK, updateResult);
    return;
  }
};
