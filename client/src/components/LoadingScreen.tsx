import * as React from 'react';
import { Spin } from 'antd';

// const antIcon = <Icon type="loading" style={{ fontSize: 24 }} spin />;

export const LoadingScreen = (props: React.PropsWithChildren<{ show: boolean }>) => {
  if (!props.show) {
    return <>{props.children}</>;
  }
  return (
    <div
      className="loading-screen"
      style={{
        justifyContent: 'center',
        alignItems: 'center',
        display: 'flex',
        width: '100vw',
        position: 'fixed',
        height: '100vh',
      }}
    >
      <Spin tip="Loading..." style={{ fontSize: 20 }} />
      <style jsx>{`
        .loading-screen {
          z-index: 1;
          top: 0;
          left: 0;
          background-color: #fff;
        }
      `}</style>
    </div>
  );
};
