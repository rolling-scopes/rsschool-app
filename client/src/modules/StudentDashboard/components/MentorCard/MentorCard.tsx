import { Descriptions, Row } from 'antd';
import { MentorBasic } from 'common/models';
import CommonCard from '../CommonDashboardCard';
import { MentorContact, MentorInfo } from './MentorInfo';
import { SubmitTaskSolution } from './SubmitTaskSolution';

export type MentorCardProps = {
  mentor?: (MentorBasic & MentorContact) | null;
  courseId: number;
};

export const ASSERTION =
  "Even if you don't have your own mentor, you can submit a task for review and someone else's mentor will review it if they have the time and desire";

export function MentorCard({ mentor, courseId }: MentorCardProps) {
  return (
    <CommonCard
      title="Mentor's check"
      content={
        <>
          {mentor ? (
            <MentorInfo mentor={mentor} />
          ) : (
            <Descriptions layout="horizontal" column={1} size="small">
              <Descriptions.Item labelStyle={{ color: '#b2b2b2' }} label="Note">
                {ASSERTION}
              </Descriptions.Item>
            </Descriptions>
          )}
          <Row justify="center">
            <SubmitTaskSolution courseId={courseId} />
          </Row>
        </>
      }
    />
  );
}
