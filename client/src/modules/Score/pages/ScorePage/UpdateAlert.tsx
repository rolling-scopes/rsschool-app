import { theme, Tooltip, Typography } from 'antd';
import css from 'styled-jsx/css';
import { QuestionCircleOutlined } from '@ant-design/icons';

const { Text } = Typography;

export const UpdateAlert = () => {
  const { token } = theme.useToken();
  const text = 'Total score and position is updated every day at 04:00 GMT+3';
  return (
    <>
      <div className="container">
        <div className="wrapper" style={{ backgroundColor: token.colorWarning }}>
          <Text>{text}</Text>
        </div>
        <div className="icon">
          <Tooltip title={text} placement="left">
            <QuestionCircleOutlined
              style={{
                color: token.colorWarning,
                fontSize: '2.5ch',
                display: 'block',
              }}
            />
          </Tooltip>
        </div>
      </div>
      <style jsx>{styles}</style>
    </>
  );
};

const styles = css`
  .container {
    position: relative;
  }

  .wrapper {
    width: 55ch;
    border-radius: 2.5ch;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    position: absolute;
    right: 0;
    top: 0;
    bottom: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    animation: disappear 5s ease-in-out 5s forwards;
  }

  .icon {
    opacity: 0;
    animation:
      appear 1.3s ease-in 8s forwards,
      pulse 0.7s 10s ease-in 1;
  }

  @media (max-width: 640px) {
    .wrapper {
      visibility: hidden;
    }

    .icon {
      opacity: 1;
    }
  }

  @keyframes disappear {
    0% {
      width: 55ch;
      opacity: 1;
    }
    80% {
      opacity: 1;
      height: initial;
    }
    100% {
      width: 0;
      height: 0;
      opacity: 0;
    }
  }

  @keyframes appear {
    from {
      opacity: 0;
      scale: 0;
    }
    to {
      opacity: 1;
      scale: 1;
    }
  }

  @keyframes pulse {
    0% {
      scale: 0.8;
    }
    60% {
      scale: 1.2;
    }
    75% {
      scale: 0.8;
    }
    100% {
      scale: 1;
    }
  }
`;
