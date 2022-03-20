import { Alert } from 'antd';
import React from 'react';
import { formatDate } from 'services/formatter';
import { TaskSolution } from 'services/course';

type Props = {
  solution: TaskSolution | null;
  deadlinePassed: boolean;
  taskExists: boolean;
};

export function SubmittedStatus(props: Props) {
  const { taskExists, solution, deadlinePassed } = props;

  if (!taskExists) return null;

  if (!solution) {
    const deadlinePassedMessage = 'Sumbission deadline has already passed';
    const message = `You haven't submitted solution. ${deadlinePassed ? deadlinePassedMessage : ''}`;
    return <Alert message={message} type="info" showIcon style={{ marginBottom: 8 }} />;
  }

  return (
    <Alert
      message={
        <>
          Submitted{' '}
          <a className="crosscheck-submitted-link" target="_blank" href={solution.url}>
            {solution.url}
          </a>{' '}
          on {formatDate(solution.updatedDate)}.
        </>
      }
      type="success"
      showIcon
      style={{ marginBottom: 8 }}
    />
  );
}
