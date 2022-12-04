import { useRouter } from 'next/router';
import React from 'react';
import { CoursePageProps } from 'services/models';

function Task({ course }: CoursePageProps) {
  const { query } = useRouter();

  return <div>{query.courseTaskId}</div>;
}

export default Task;
