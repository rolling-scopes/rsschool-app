import { theme, Tooltip, Typography } from 'antd';
import { QuestionCircleOutlined } from '@ant-design/icons';
import styles from './UpdateAlert.module.css';

const { Text } = Typography;

export const UpdateAlert = () => {
  const { token } = theme.useToken();
  const text = 'Total score and position is updated every day at 04:00 GMT+3';
  return (
    <>
      <div className={styles.container}>
        <div className={styles.wrapper} style={{ backgroundColor: token.colorWarning }}>
          <Text>{text}</Text>
        </div>
        <div className={styles.icon}>
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
    </>
  );
};
