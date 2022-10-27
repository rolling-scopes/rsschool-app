import React from 'react';
import { Badge, Card, Space, Typography } from 'antd';
import { INSTRUCTIONS_TEXT, renderSocialLinks } from '.';

const { Meta, Grid } = Card;
const { Text } = Typography;

function Instructions() {
  const { title, description, steps } = INSTRUCTIONS_TEXT;

  return (
    <Card bordered={false}>
      <Grid style={{ width: '100%' }} hoverable={false}>
        <Meta title={title} description={<Text>{description}</Text>} />
      </Grid>
      {steps.map((s, idx) => (
        <Grid key={s.title} hoverable={false} style={{ width: '33.33333%' }}>
          <Meta
            title={
              <Space>
                <Badge count={idx + 1} style={{ backgroundColor: '#1890FF' }} />
                {s.title}
              </Space>
            }
            description={
              <Space direction="vertical" size="middle">
                <Text>
                  <div dangerouslySetInnerHTML={{ __html: s.html }}></div>
                </Text>
                {s.links ? renderSocialLinks(s.links) : null}
              </Space>
            }
          />
        </Grid>
      ))}
    </Card>
  );
}

export default Instructions;
