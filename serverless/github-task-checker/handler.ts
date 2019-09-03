import { APIGatewayEvent, SQSEvent, SQSHandler } from 'aws-lambda';
import * as aws from 'aws-sdk';
import { chunk } from 'lodash';
import { worker } from './jsTask';

const sqs = new aws.SQS();

export type TaskEvent = {
  task: {
    id: number;
    type: 'js' | 'html';
    repositoryName: string;
  };
  studentId: number;
  githubId: string;
};

export const submitTask = async (event: APIGatewayEvent) => {
  console.info('event', event);

  const records: TaskEvent[] = JSON.parse(event.body!);
  const chunks = chunk(records, 10);
  await Promise.all(
    chunks.map(chunk =>
      sqs
        .sendMessageBatch({
          QueueUrl: process.env.JSTASK_SQS_URL!,
          Entries: chunk.map(r => ({
            Id: `${r.studentId}_${r.task.id.toString()}`,
            MessageBody: JSON.stringify(r),
          })),
        })
        .promise(),
    ),
  );

  return {
    statusCode: 200,
    body: JSON.stringify({ status: 'ok' }),
  };
};

export const checkJsTask: SQSHandler = async (event: SQSEvent, _context: any) => {
  const [record] = event.Records;
  const data: TaskEvent = JSON.parse(record.body);
  const resp = await worker(data);
  console.log(resp);
};
