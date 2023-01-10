import { ReactNode } from 'react';
import { Space } from 'antd';
import { CountBadge } from 'components/CountBadge';

export type LabelItem = {
  label: string;
  key: string;
  count: number;
};

type TabItem = {
  label: ReactNode;
  key: string;
};

export const labelRender = ({ count, label, key }: LabelItem, activeTab?: string): TabItem => {
  const isTabActive = activeTab === key;
  return {
    key,
    label: count ? (
      <Space>
        {label}
        <CountBadge showZero count={count} status={isTabActive ? 'processing' : 'default'} />
      </Space>
    ) : (
      label
    ),
  };
};
