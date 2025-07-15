import * as React from 'react';
import { Spin, theme } from 'antd';

type Props = React.PropsWithChildren<{ show: boolean }>;

export const LoadingScreen = (props: Props) => {
  const { token } = theme.useToken();
  if (!props.show) {
    return <>{props.children}</>;
  }
  return (
    <div
      data-testid="loading-screen"
      className="loading-screen"
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
      <style jsx>{`
        .loading-screen {
          z-index: 1;
          top: 0;
          left: 0;
        }
      `}</style>
    </div>
  );
};
