import * as React from 'react';
import css from 'styled-jsx/css';
import { Spin, Icon } from 'antd';

const antIcon = <Icon type="loading" style={{ fontSize: 24 }} spin />;

export const LoadingScreen = (props: React.PropsWithChildren<{ show: boolean }>) => {
  if (!props.show) {
    return <>{props.children}</>;
  }
  return (
    <div className="loading-screen">
      <Spin tip="Loading..." indicator={antIcon} style={{ fontSize: 20 }} />
      <style jsx>{styles}</style>
    </div>
  );
};

const styles = css`
  .loading-screen {
    z-index: 1;
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: #fff;
  }
`;
