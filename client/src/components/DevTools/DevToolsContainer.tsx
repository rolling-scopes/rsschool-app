import { Button, Card, FloatButton } from 'antd';
import { CSSProperties, ReactNode, useState } from 'react';
import { BugOutlined, CloseOutlined } from '@ant-design/icons';
import DevToolsUsers from '@client/components/DevTools/DevToolsUsers';
import DevToolsCurrentUser from '@client/components/DevTools/DevToolsCurrentUser';

const STYLE: CSSProperties = {
  position: 'fixed',
  bottom: '2rem',
  right: '2rem',
};

const TABS = [
  {
    key: 'users',
    tab: 'Users',
  },
  {
    key: 'currentUser',
    tab: 'Current user session',
  },
];

const TAB_CONTENT: Record<string, ReactNode> = {
  users: <DevToolsUsers />,
  currentUser: <DevToolsCurrentUser />,
};

export function DevToolsContainer({ children }: { children?: ReactNode }) {
  const [visible, setVisible] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>('users');

  function toggleVisible() {
    setVisible(prev => !prev);
  }

  function onTabChange(key: string) {
    setActiveTab(key);
  }

  return (
    <>
      {children}
      {!visible ? (
        <FloatButton shape="circle" type="primary" icon={<BugOutlined />} onClick={toggleVisible} style={STYLE} />
      ) : (
        <Card
          title="Dev tools"
          tabList={TABS}
          activeTabKey={activeTab}
          onTabChange={onTabChange}
          extra={<Button type="link" icon={<CloseOutlined />} onClick={toggleVisible} />}
          style={{
            ...STYLE,
            width: '40rem',
            height: '26rem',
          }}
        >
          {TAB_CONTENT[activeTab]}
        </Card>
      )}
    </>
  );
}
