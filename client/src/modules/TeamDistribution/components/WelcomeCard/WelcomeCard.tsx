import { Card, Col, Row, Typography } from 'antd';
import { useMedia } from 'react-use';

const { Text } = Typography;

export default function WelcomeCard() {
  const mobileView = useMedia('(max-width: 720px)');
  return (
    <Card
      title={<Text style={{ color: '#fff' }}>Become a member of the team!</Text>}
      style={{ marginTop: 24, backgroundColor: '#539DE2' }}
    >
      <Row gutter={24} style={{ minHeight: '100px' }}>
        <Col span={!mobileView ? 12 : 24}>
          <Text style={{ color: '#fff' }}>
            Group task – it is a possibility to unite with your colleagues to develop the best solutions, and to gain
            knowledge and skills.
            <br /> To become a member of a team, you can create your own team or join an existing team. If you don't
            choose to do either of these, you will be added to a team automatically.
          </Text>
        </Col>
        {!mobileView && (
          <Col span={12} style={{ position: 'relative', display: 'flex', justifyContent: 'end', paddingRight: '24px' }}>
            <div
              style={{
                backgroundImage: `url(https://cdn.rs.school/sloths/stickers/welcome/image.png)`,
                position: 'absolute',
                top: '-120px',
                backgroundSize: 'contain',
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'center',
                height: '240px',
                width: '240px',
              }}
            />
          </Col>
        )}
      </Row>
    </Card>
  );
}
