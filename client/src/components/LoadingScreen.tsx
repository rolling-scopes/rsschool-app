import * as React from 'react';
import { Spin, theme } from 'antd';

export const LoadingScreen = (
  props: React.PropsWithChildren<{
    show: boolean;
  }>,
) => {
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
        background: theme.useToken().token.colorBgContainer
      }}
    >
      <Spin tip="Loading..." size='default'>
        <div className="content" />
      </Spin>
      <style jsx>{`
        .loading-screen {
          z-index: 1;
          top: 0;
          left: 0;
        }

        .content {
          padding: 50px;
        }
      `}</style>
    </div>
  );
};
