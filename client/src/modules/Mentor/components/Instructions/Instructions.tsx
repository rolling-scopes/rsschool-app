import React from 'react';
import { Badge, Card, Col, Divider, Row, Space, Typography } from 'antd';
import { INSTRUCTIONS_TEXT, renderDescription, renderSocialLinks } from '.';

const { Meta, Grid } = Card;
const { Text } = Typography;

function Instructions() {
  const { title, description, steps } = INSTRUCTIONS_TEXT;

  return (
    <Card bordered={false}>
      <Grid style={{ width: '100%' }} hoverable={false}>
        <Meta title={title} description={<Text>{description}</Text>} />
      </Grid>
      <Row>
        {steps.map((s, idx) => (
          <Col key={s.title} xs={24} sm={24} md={8}>
            <Grid hoverable={false} style={{ width: '100%', height: '100%' }}>
              <Meta
                title={
                  <Space>
                    <Badge count={idx + 1} style={{ backgroundColor: '#1890FF' }} />
                    {s.title}
                  </Space>
                }
                description={
                  <Space direction="vertical" size="middle">
                    {renderDescription(s.html)}
                    {s.links ? renderSocialLinks(s.links) : null}
                  </Space>
                }
              />
            </Grid>
          </Col>
        ))}
      </Row>
    </Card>
  );
}

export default Instructions;
