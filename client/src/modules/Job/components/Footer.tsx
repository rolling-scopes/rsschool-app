import { QuestionCircleOutlined } from '@ant-design/icons';
import { Button, Space } from 'antd';
import { COLORS } from '../theme/colors';

export const Footer = () => {
  return (
    <>
      <footer className="footer">
        <Space size={32}>
          <img src="/static/svg/jobs/logo-footer-rs.svg" alt="logo_rss" />
          <img src="/static/svg/jobs/logo-footer-github.svg" alt="logo_github" />
        </Space>
        <Button type="text" icon={<QuestionCircleOutlined />}>
          Help
        </Button>
      </footer>

      <style jsx>{`
        .footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          width: 100%;
          height: 48px;
          padding: 0 48px;
          background: ${COLORS.Neutral_2};
        }
      `}</style>
    </>
  );
};
