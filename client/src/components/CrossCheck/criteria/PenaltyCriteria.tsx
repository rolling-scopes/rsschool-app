import React from 'react';
import { Radio, Typography } from 'antd';

import { CrossCheckCriteriaData, ICountState } from '../CrossCheckCriteriaForm';

const { Text } = Typography;
const { Group } = Radio;

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
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        background: '#FAFAFA',
        borderBottom: '1px solid #F5F5F5',
        margin: '24px 0',
        padding: '14px 12px',
      }}
      key={task.key}
    >
      <Text style={{ display: 'inline-block', fontSize: '14px', width: 'calc(100% - 200px)' }}>
        {task.text} ({penaltyScore} points)
      </Text>

      <Group
        style={{ display: 'block' }}
        size="middle"
        value={isPenaltyTrue ? 'yes' : ''}
        buttonStyle="solid"
        onChange={event => updatePenalty(penaltyScore, task.key, event.target.value)}
      >
        <Radio value="yes">Yes</Radio>
        <Radio value="">No</Radio>
      </Group>
    </div>
  );
}
