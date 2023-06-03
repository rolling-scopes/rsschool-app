import { Typography } from 'antd';
import Link from 'next/link';

export function NoSubmissionAvailable({ courseAlias }: { courseAlias: string }) {
  return (
    <>
      <Typography.Title level={4}>No tasks available for submission now</Typography.Title>
      Check start dates in <Link href={`/course/schedule?course=${courseAlias}`}>Schedule</Link>
    </>
  );
}
