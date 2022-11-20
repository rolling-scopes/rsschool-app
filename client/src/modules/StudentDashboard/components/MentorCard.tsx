import { Row } from 'antd';
import { MentorBasic } from 'common/models';
import CommonCard from './CommonDashboardCard';
import { MentorInfo } from './MentorInfo';
import { SubmitTaskSolution } from './SubmitTaskSolution';

type Props = {
  mentor?: MentorBasic;
  courseId: number;
};

export function MentorCard({ mentor, courseId }: Props) {
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
