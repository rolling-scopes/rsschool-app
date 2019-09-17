import { APIGatewayEvent } from 'aws-lambda';
import * as aws from 'aws-sdk';
import { chunk } from 'lodash';

const sqs = new aws.SQS();

export type TaskEvent = {
  courseTask: JsTask | HtmlTask | ExternalTask;
  studentId: number;
  githubId: string;
};

export type JsTask = {
  id: number;
  type: 'jstask';
  githubRepoName: string;
};

export type HtmlTask = {
  id: number;
  type: 'htmltask';
  githubPageUrl: string;
};

export type ExternalTask = {
  id: number;
  type: 'externaltask';
  codecademy: string;
  htmlacademy: string;
  udemy: string[];
};

export const handler = async (event: APIGatewayEvent) => {
  console.info('event', event);

  const records: TaskEvent[] = JSON.parse(event.body!);
  const jsTaskRecords = records.filter(r => r.courseTask.type === 'jstask');
  const externalTaskRecords = records.filter(r => r.courseTask.type === 'externaltask');

  if (jsTaskRecords.length > 0) {
    const chunks = chunk(jsTaskRecords, 10);
    await Promise.all(
      chunks.map(chunk =>
        sqs
          .sendMessageBatch({
            QueueUrl: process.env.JSTASK_SQS_URL!,
            Entries: chunk.map(r => ({
              Id: `${r.studentId}_${r.courseTask.id.toString()}`,
              MessageBody: JSON.stringify(r),
            })),
          })
          .promise(),
      ),
    );
  }
  if (externalTaskRecords.length > 0) {
    const chunks = chunk(externalTaskRecords, 10);
    await Promise.all(
      chunks.map(chunk =>
        sqs
          .sendMessageBatch({
            QueueUrl: process.env.EXTERNAL_TASK_SQS_URL!,
            Entries: chunk.map(r => ({
              Id: `${r.studentId}_${r.courseTask.id.toString()}`,
              MessageBody: JSON.stringify(r),
            })),
          })
          .promise(),
      ),
    );
  }

  return {
    statusCode: 200,
    body: JSON.stringify({ status: 'ok' }),
  };
};
