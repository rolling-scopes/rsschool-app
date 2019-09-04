import { APIGatewayEvent } from 'aws-lambda';
import * as aws from 'aws-sdk';
import { chunk } from 'lodash';

const sqs = new aws.SQS();

export type TaskEvent = {
  courseTask: {
    id: number;
    type: 'js';
    githubRepoName: string;
  } & {
    id: number;
    type: 'html';
    githubPageUrl: string;
  };
  studentId: number;
  githubId: string;
};

export const handler = async (event: APIGatewayEvent) => {
  console.info('event', event);

  const records: TaskEvent[] = JSON.parse(event.body!);
  const jsTaskRecords = records.filter(r => r.courseTask.type === 'js');

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

  return {
    statusCode: 200,
    body: JSON.stringify({ status: 'ok' }),
  };
};
