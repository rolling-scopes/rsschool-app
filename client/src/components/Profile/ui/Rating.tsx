import { Rate, Space, Typography } from 'antd';

type Props = { rating: number; tooltips?: string[] };

export function Rating(props: Props) {
  const { rating, tooltips } = props;

  return (
    <Space align="center">
      <Rate
        tooltips={tooltips}
        allowHalf={true}
        value={roundHalf(rating)}
        disabled={true}
        style={{ display: 'flex', flexWrap: 'nowrap', fontSize: 'clamp(0.9em, 1.5vw, 1.5em)', fontWeight: 'bold' }}
      />
      {tooltips ? (
        <Typography.Text>{tooltips[Math.round(rating) - 1]}</Typography.Text>
      ) : (
        <Typography.Text>
          {rating.toFixed(2)}
        </Typography.Text>
      )}
    </Space>
  );
}

function roundHalf(num: number) {
  return Math.round(num * 2) / 2;
}
