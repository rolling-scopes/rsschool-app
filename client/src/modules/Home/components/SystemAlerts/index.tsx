import { Alert } from 'antd';
import type { AlertDto } from 'api';
import React from 'react';

type Props = {
  alerts: AlertDto[];
};

export function SystemAlerts({ alerts }: Props) {
  return (
    <>
      {alerts.map(({ text, type }) => {
        const alertType = type === 'warn' ? 'warning' : type;
        return <Alert key={text} style={{ margin: '8px 0' }} type={alertType as any} showIcon message={text} />;
      })}
    </>
  );
}
