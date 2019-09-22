import { handler } from './jsTask';
import { Context } from 'aws-lambda';

const context = {
  callbackWaitsForEmptyEventLoop: false,
  functionName: 'test',
  functionVersion: 'test',
  invokedFunctionArn: 'test',
  memoryLimitInMB: 128,
  awsRequestId: 'test',
  logGroupName: 'test',
  logStreamName: 'test',
} as Context;

const callback = () => {};

describe('jsTask.handler()', () => {
  it('This is a test case for checking lambda input parameters', async () => {
    const event = {
      Records: [
        {
          messageId: 'test',
          receiptHandle: 'test',
          attributes: {
            ApproximateReceiveCount: 'test',
            SentTimestamp: 'test',
            SenderId: 'test',
            ApproximateFirstReceiveTimestamp: 'test',
          },
          messageAttributes: {},
          md5OfBody: 'test',
          eventSource: 'test',
          eventSourceARN: 'test',
          awsRegion: 'test',
          body: JSON.stringify({
            studentId: 1,
            githubId: '4eKoshka',
            courseTask: {
              id: 1,
              type: 'jstask',
              githubRepoName: 'additional_5',
              sourceGithubRepoUrl: 'https://github.com/Shastel/brackets',
            },
          }),
        },
      ],
    };

    // Uncoment the line below in order to see the logs that handler will produce
    await handler(event, context, callback);

    expect(true).toBe(true);
  });
});
