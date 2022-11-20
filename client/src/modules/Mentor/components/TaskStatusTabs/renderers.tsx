import { Space } from 'antd';
import { ReactNode } from 'react';
import { Status } from '.';
import { CountBadge } from 'components/CountBadge';
import { SolutionItemStatus, TASKS_STATUSES } from 'modules/Mentor/constants';

type TabItem = {
  label: ReactNode;
  key: string;
};

export const tabsRenderer = (statuses?: Status[], activeTab?: Status): TabItem[] =>
  TASKS_STATUSES.reduce((tabs: TabItem[], { label, key }: { label: string; key: string }) => {
    const count = statuses?.filter(el => el === key).length ?? 0;
    const badgeStatus = activeTab === key ? 'processing' : 'default';
    const readableLabel = label.replace(/([A-Z])/g, ' $1');

    const tab = {
      key,
      label: (
        <Space>
          {readableLabel}
          <CountBadge showZero count={count} status={badgeStatus} />
        </Space>
      ),
    };

    return [...tabs, tab];
  }, [])
    // Do not show Random task tab
    // until students without mentors could not send tasks for review
    .filter(tab => tab.key !== SolutionItemStatus.RandomTask);
