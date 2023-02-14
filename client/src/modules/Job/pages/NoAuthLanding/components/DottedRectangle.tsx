import { Space } from 'antd';
import { COLORS } from '../../../theme/colors';

export const DottedRectangle = () => {
  const SIZE = new Array(40).fill(null);

  return (
    <Space size={32} wrap>
      {SIZE.map((_, index) => (
        <span key={index} className="dot"></span>
      ))}

      <style jsx>
        {`
          .dot {
            display: flex;
            width: 16px;
            height: 16px;
            border-radius: 16px;
            border: 1px solid;
            border-color: ${COLORS.Neutral_9};
          }
          .container {
            display: flex;
            flex-wrap: wrap;
            max-width: 352px;
            gap: 32px;
          }
        `}
      </style>
    </Space>
  );
};
