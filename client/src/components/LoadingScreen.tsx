import * as React from 'react';
import { Spin, theme } from 'antd';
import styles from './LoadingScreen.module.css';

type Props = React.PropsWithChildren<{ show: boolean }>;

export const LoadingScreen = (props: Props) => {
  const { token } = theme.useToken();
  if (!props.show) {
    return <>{props.children}</>;
  }
  return (
    <div
      data-testid="loading-screen"
      className={styles.loadingScreen}
      style={{
        justifyContent: 'center',
        alignItems: 'center',
        display: 'flex',
        width: '100vw',
        position: 'fixed',
        height: '100vh',
        background: token.colorBgContainer,
      }}
    >
      <Spin tip="Loading..." size="default">
        <div style={{ padding: '50px' }} />
      </Spin>
    </div>
  );
};
