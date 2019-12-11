import * as React from 'react';
import { Rate, Typography, Tag } from 'antd';

type Props = {
  rating: number;
  tooltips?: string[];
};

export class Rating extends React.PureComponent<Props> {
  private roundHalf = num => Math.round(num * 2) / 2;

  render() {
    const { rating, tooltips } = this.props;

    return (
      <>
        {rating > 0 ? (
          <>
            <Rate
              tooltips={tooltips}
              allowHalf={true}
              value={this.roundHalf(rating)}
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
        ) : (
          <Tag color="orange">Partially rated</Tag>
        )}
      </>
    );
  }
}
