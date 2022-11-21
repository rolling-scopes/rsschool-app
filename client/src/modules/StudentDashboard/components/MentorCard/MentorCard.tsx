import { Row } from 'antd';
import { MentorBasic } from 'common/models';
import CommonCard from '../CommonDashboardCard';
import { MentorContact, MentorInfo } from './MentorInfo';
import { SubmitTaskSolution } from './SubmitTaskSolution';

export type MentorCardProps = {
  mentor?: MentorBasic & MentorContact;
  courseId: number;
};

export function MentorCard({ mentor, courseId }: MentorCardProps) {
  return (
    <CommonCard
      title="Mentor"
      content={
        <>
          {mentor ? <MentorInfo mentor={mentor} /> : null}
          <Row justify="center">
            <SubmitTaskSolution courseId={courseId} />
          </Row>
        </>
      }
    />
  );
}
