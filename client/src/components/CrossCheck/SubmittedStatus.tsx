import { Alert } from 'antd';
import React from 'react';
import { formatDate } from 'services/formatter';
import { TaskSolution } from 'services/course';

export function SubmittedStatus({ solution }: { solution: TaskSolution | null }) {
  if (!solution) {
    return null;
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
