import { QuestionCircleOutlined } from '@ant-design/icons';
import { Button, Col, Image, Layout, Row } from 'antd';

const { Footer: FooterAnt } = Layout;

export const Footer = () => {
  return (
    <>
      <FooterAnt>
        <Row justify="space-between">
          <Col>
            <div className="wrap-images">
              <Image src="/static/svg/jobs/logo-footer-rs.svg" alt="logo_rss" preview={false} />
              <Image src="/static/svg/jobs/logo-footer-github.svg" alt="logo_github" preview={false} />
            </div>
          </Col>
          <Col>
            <Button type="text" icon={<QuestionCircleOutlined />}>
              Help
            </Button>
          </Col>
        </Row>
      </FooterAnt>

      <style jsx>{`
        .wrap-images {
          display: flex;
          gap: 32px;
        }
        @media (max-width: 400px) {
          .wrap-images {
            flex-direction: column;
          }
        }
      `}</style>
    </>
  );
};
