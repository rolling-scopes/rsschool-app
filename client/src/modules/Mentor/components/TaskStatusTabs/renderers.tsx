import { Space } from 'antd';
import { ReactNode } from 'react';
import { Status } from '.';
import { CountBadge } from 'components/CountBadge';
import { TASKS_STATUSES } from 'modules/Mentor/constants';

type TabItem = {
  label: ReactNode;
  key: string;
};

export const tabsRenderer = (statuses?: Status[], activeTab?: Status): TabItem[] =>
  TASKS_STATUSES.reduce((tabs: TabItem[], { label, key }: TabItem) => {
    const count = statuses?.filter(el => el === key).length ?? 0;
    const badgeStatus = activeTab === key ? 'processing' : 'default';

    const tab = {
      key,
      label: (
        <Space>
          {label}
          <CountBadge showZero count={count} status={badgeStatus} />
        </Space>
      ),
    };

    return [...tabs, tab];
  }, []);
