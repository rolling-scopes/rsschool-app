import axios from 'axios';
import { SQSEvent, SQSHandler } from 'aws-lambda';
import { TaskEvent } from './submitTask';
import checkExternalTask from '../checkExternalTask';

export const handler: SQSHandler = async (event: SQSEvent) => {
  console.log('Event was received =>', JSON.stringify(event));

  const [record] = event.Records;
  const data: TaskEvent = JSON.parse(record.body);

  const { score, details } = await checkExternalTask(data);

  const result = {
    score,
    studentId: data.studentId,
    courseTaskId: data.courseTask.id,
  };

  const requestConfig = {
    headers: {
      Authorization: process.env.RS_APP_AUTHORIZATION,
    },
  };

  console.log('Score will be saved =>', JSON.stringify(result));

  await Promise.all([
    axios.post(`https://app.rs.school/api/taskResult`, result, requestConfig),
    axios
      .post(
        `https://app.rs.school/api/task-verification`,
        {
          courseTaskId: result.courseTaskId,
          studentId: result.studentId,
          details,
          score,
          status: 'success',
        },
        requestConfig,
      )
      .catch(e => {
        console.error(e);
      }),
  ]);
};
