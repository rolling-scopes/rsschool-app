import React from 'react';
import { Radio, Typography } from 'antd';
import { CheckOutlined } from '@ant-design/icons';

import { CrossCheckCriteriaData, ICountState } from '../CrossCheckCriteriaForm';

const { Text } = Typography;
const { Group, Button } = Radio;

interface PenaltyCriteriaProps {
  task: CrossCheckCriteriaData;
  updatePenalty: (max: number, key: string, value: string) => void;
  penalty: ICountState[];
}

export default function PenaltyCriteria({ task, updatePenalty, penalty }: PenaltyCriteriaProps) {
  const pointForPenalty = penalty.filter(item => task.key === item.key)[0]?.point;
  const isPenaltyTrue = pointForPenalty ? pointForPenalty !== 0 : false;

  const penaltyScore = -Math.abs(task.max!);
  return (
    <React.Fragment key={task.key}>
      <Text style={{ display: 'inline-block', margin: '15px 0 20px 0', fontSize: '14px' }}>
        <CheckOutlined style={{ margin: '0 5px 0 0' }} />
        {task.text}
      </Text>
      <Text style={{ display: 'inline-block', margin: '0 0 0 5px', fontSize: '14px' }}>{penaltyScore}</Text>
      <Group
        style={{ display: 'block' }}
        size="middle"
        value={isPenaltyTrue ? 'yes' : ''}
        buttonStyle="solid"
        onChange={event => updatePenalty(penaltyScore, task.key, event.target.value)}
      >
        <Button value="yes">Yes</Button>
        <Button value="">No</Button>
      </Group>
    </React.Fragment>
  );
}
