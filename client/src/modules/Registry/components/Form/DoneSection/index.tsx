import { Card, Image, Row, Typography } from 'antd';
import { SUCCESS_TEXT } from 'modules/Registry/constants';

const { Title, Paragraph } = Typography;
const arrowSvg = (
  <svg width="24" height="65" viewBox="0 0 24 65" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M10.9393 63.7296C11.5251 64.3154 12.4749 64.3154 13.0607 63.7296L22.6066 54.1837C23.1924 53.5979 23.1924 52.6481 22.6066 52.0623C22.0208 51.4766 21.0711 51.4766 20.4853 52.0623L12 60.5476L3.51472 52.0623C2.92893 51.4766 1.97918 51.4766 1.3934 52.0623C0.807609 52.6481 0.807609 53.5979 1.3934 54.1837L10.9393 63.7296ZM10.5 -6.5567e-08L10.5 62.6689L13.5 62.6689L13.5 6.5567e-08L10.5 -6.5567e-08Z"
      fill="#1890FF"
    />
  </svg>
);

export function DoneSection() {
  return (
    <Card
      style={{
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '28px',
      }}
    >
      <Row justify="center">
        <Image
          style={{ padding: '4px 0', marginBottom: '28px' }}
          preview={false}
          src="https://cdn.rs.school/sloths/stickers/slothzy/image.png"
          alt="slothzy"
        />
      </Row>
      <Row style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '16px' }}>
        <Row justify="center">
          <Title level={3} style={{ margin: 0 }}>
            Success
          </Title>
        </Row>
        <Row justify="center">
          <Title level={3} style={{ textTransform: 'uppercase', color: '#1890FF', margin: 0 }}>
            but
          </Title>
        </Row>
        <Row justify="center">{arrowSvg}</Row>
        <Row justify="center">
          <Paragraph style={{ color: 'rgba(0, 0, 0, 0.43)', maxWidth: '480px', textAlign: 'center', margin: 0 }}>
            {SUCCESS_TEXT}
          </Paragraph>
        </Row>
        <Row justify="center">
          <Paragraph style={{ color: 'rgba(0, 0, 0, 0.43)', textAlign: 'center', margin: 0 }}>See you soon</Paragraph>
        </Row>
      </Row>
    </Card>
  );
}
