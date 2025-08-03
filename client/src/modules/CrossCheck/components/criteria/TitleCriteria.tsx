import { theme, Typography } from 'antd';
import { CrossCheckCriteriaDataDto } from 'api';
import React from 'react';

interface TitleCriteriaProps {
  titleData: CrossCheckCriteriaDataDto;
}
const { Text } = Typography;

export function TitleCriteria({ titleData }: TitleCriteriaProps) {
  const { token } = theme.useToken();
  return (
    <div
      style={{
        display: 'block',
        fontSize: '14px',
        marginTop: '10px',
        background: token.blue2,
        border: '1px solid #91D5FF',
        borderRadius: '2px',
        padding: '9px',
      }}
    >
      <Text key={titleData.key}>{titleData.text}</Text>
    </div>
  );
}
