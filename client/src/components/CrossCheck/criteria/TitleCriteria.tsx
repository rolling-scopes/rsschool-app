import { Typography } from 'antd';
import React from 'react';

import { CrossCheckCriteriaData } from '../CrossCheckCriteriaForm';

interface TitleCriteriaProps {
  task: CrossCheckCriteriaData;
}
const { Text } = Typography;

export default function TitleCriteria({ task }: TitleCriteriaProps) {
  return (
    <Text key={task.key} style={{ display: 'block', fontSize: '16px', fontStyle: 'italic', marginTop: '20px' }}>
      {task.text}
    </Text>
  );
}
