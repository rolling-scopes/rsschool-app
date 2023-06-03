import * as React from 'react';
import { Rate, Typography, Tag } from 'antd';

type Props = { rating: number; tooltips?: string[] };

export function Rating(props: Props) {
  const { rating, tooltips } = props;

  if (rating <= 0) {
    return <Tag color="orange">Partially rated</Tag>;
  }

  return (
    <>
      <Rate
        tooltips={tooltips}
        allowHalf={true}
        value={roundHalf(rating)}
        disabled={true}
        style={{ marginBottom: '5px' }}
      />
      {tooltips ? (
        <Typography.Text className="ant-rate-text">{tooltips[Math.round(rating) - 1]}</Typography.Text>
      ) : (
        <Typography.Text className="ant-rate-text" style={{ fontWeight: 'bold' }}>
          {rating.toFixed(2)}
        </Typography.Text>
      )}
    </>
  );
}

function roundHalf(num: number) {
  return Math.round(num * 2) / 2;
}
