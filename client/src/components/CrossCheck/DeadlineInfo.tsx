import React from 'react';
import { Typography } from 'antd';

export function DeadlineInfo({ isSubmitDisabled }: { isSubmitDisabled: boolean }) {
  if (!isSubmitDisabled) {
    return null;
  }
  return (
    <div style={{ marginBottom: 16 }}>
      <Typography.Text mark type="warning">
        The deadline has passed already
      </Typography.Text>
    </div>
  );
}
