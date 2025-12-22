import { Col, Typography, Row } from 'antd';
import CommonCard from '../CommonDashboardCard';
import { MentorInfo } from '../MentorInfo';
import { SubmitTaskSolution } from '../SubmitTaskSolution';
import { MentorStudentSummaryDto } from '@client/api';

export type MentorCardProps = {
  mentor?: MentorStudentSummaryDto | null;
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
            <Row gutter={8} style={{ marginBottom: 16 }} wrap={false}>
              <Col flex={'none'}>
                <Text type="secondary">Note:</Text>
              </Col>
              <Col flex={'auto'}>
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
