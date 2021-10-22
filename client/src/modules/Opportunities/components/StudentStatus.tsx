import { SafetyCertificateTwoTone, ClockCircleTwoTone, CheckCircleTwoTone } from '@ant-design/icons';
import * as React from 'react';

export function StudentStatus(props: { certificateId: string | null; isCourseCompleted: boolean }) {
  const { certificateId, isCourseCompleted } = props;

  if (certificateId) {
    return (
      <span>
        <SafetyCertificateTwoTone twoToneColor="#52c41a" /> Completed with{' '}
        <a target="_blank" rel="nofollow" href={`/certificate/${certificateId}`}>
          certificate
        </a>
      </span>
    );
  }
  if (isCourseCompleted)
    return (
      <span>
        <CheckCircleTwoTone /> Completed
      </span>
    );
  return (
    <span>
      <ClockCircleTwoTone twoToneColor="#ec9607" /> In Progress
    </span>
  );
}
