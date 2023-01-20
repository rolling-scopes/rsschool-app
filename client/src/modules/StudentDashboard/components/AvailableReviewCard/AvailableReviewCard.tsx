import { Divider, Empty, Progress, Row, Typography } from 'antd';
import { AvailableReviewStatsDto } from 'api';
import CommonCard from '../CommonDashboardCard';

type Props = {
  availableReviews: AvailableReviewStatsDto[];
  courseAlias: string;
};
const { Text, Link } = Typography;

export function AvailableReviewCard({ availableReviews, courseAlias }: Props) {
  return (
    <CommonCard
      title="Cross-check [Review]"
      content={
        <>
          {availableReviews.length ? (
            <>
              {availableReviews.map((el, index) => (
                <Row key={el.id} gutter={[0, 8]}>
                  <Link target={'_blank'} href={`./cross-check-review?course=${courseAlias}&taskId=${el.id}`}>
                    {el.name}
                  </Link>
                  <Progress
                    percent={(el.completedChecksCount / el.checksCount) * 100}
                    format={() => `${el.completedChecksCount}/${el.checksCount}`}
                  />
                  {index + 1 !== availableReviews.length && <Divider />}
                </Row>
              ))}
            </>
          ) : (
            <Empty>
              <Text>At the moment, there are no tasks available for review</Text>
            </Empty>
          )}
        </>
      }
    />
  );
}
