import { Button, Card, Col, Row, theme, Typography } from 'antd';

import { PlusOutlined } from '@ant-design/icons';
import { useMedia } from 'react-use';

const { Text } = Typography;

type Props = {
  isManager: boolean;
  handleCreateTeamDistribution: () => void;
};

export default function WelcomeCard({ isManager, handleCreateTeamDistribution }: Props) {
  const mobileView = useMedia('(max-width: 768px)');
  const { token } = theme.useToken();
  return (
    <Card
      title={<Text>{isManager ? 'Create student teams to solve group tasks!' : 'Become a member of the team!'}</Text>}
      style={{
        marginTop: 24,
        backgroundColor: token.colorPrimaryBg,
      }}
    >
      <Row gutter={[24, 12]} style={{ minHeight: '100px' }}>
        <Col sm={24} md={12}>
          <Text>
            Group task – it is a possibility to unite with your colleagues to develop the best solutions, and to gain
            knowledge and skills.
            <br /> To become a member of a team, you can create your own team or join an existing team. If you don't
            choose to do either of these, you will be added to a team automatically.
          </Text>
        </Col>
        {!mobileView && (
          <Col md={12} style={{ position: 'relative', display: 'flex', justifyContent: 'end', paddingRight: '24px' }}>
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
        {isManager && (
          <Col>
            <Button type="primary" icon={<PlusOutlined />} onClick={handleCreateTeamDistribution}>
              Add a new distribution
            </Button>
          </Col>
        )}
      </Row>
    </Card>
  );
}
