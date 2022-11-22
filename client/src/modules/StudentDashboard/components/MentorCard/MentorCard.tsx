import { Col, Typography, Row } from 'antd';
import { MentorBasic } from 'common/models';
import CommonCard from '../CommonDashboardCard';
import { MentorContact, MentorInfo } from './MentorInfo';
import { SubmitTaskSolution } from './SubmitTaskSolution';

export type MentorCardProps = {
  mentor?: (MentorBasic & MentorContact) | null;
  courseId: number;
};

const { Text } = Typography;

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
            <Row gutter={8} style={{ marginBottom: 16 }}>
              <Col>
                <Text type="secondary">Note:</Text>
              </Col>
              <Col>
                <Text>{ASSERTION}</Text>
              </Col>
            </Row>
          )}
          <Row justify="center">
            <SubmitTaskSolution courseId={courseId} />
          </Row>
        </>
      }
    />
  );
}
