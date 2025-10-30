import * as React from 'react';
import { Rate, Space, Typography } from 'antd';

type Props = { rating: number; tooltips?: string[] };

export function Rating(props: Props) {
  const { rating, tooltips } = props;

  return (
    <Space align='center'>
      <Rate
        tooltips={tooltips}
        allowHalf={true}
        value={roundHalf(rating)}
        disabled={true}
        style={{display: 'flex', justifyContent: 'center', flexWrap: 'wrap'}}
      />
      {tooltips ? (
        <Typography.Text className="ant-rate-text">{tooltips[Math.round(rating) - 1]}</Typography.Text>
      ) : (
        <Typography.Text className="ant-rate-text" style={{ fontWeight: 'bold' }}>
          {rating.toFixed(2)}
        </Typography.Text>
      )}
    </Space>
  );
}

function roundHalf(num: number) {
  return Math.round(num * 2) / 2;
}
