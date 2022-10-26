import React from 'react';
import { Badge, Card, Space, Typography } from 'antd';
import { steps } from './constants';

const { Meta, Grid } = Card;
const { Text } = Typography;

function Instructions() {
  return (
    <Card bordered={false}>
      <Grid style={{ width: '100%' }} hoverable={false}>
        <Meta
          title="What's next?"
          description={<Text>No panic! information about students tasks for review will appear here.</Text>}
        />
      </Grid>
      {steps.map((s, idx) => (
        <Grid hoverable={false} style={{ width: '33.33333%' }}>
          <Meta
            title={
              <Space>
                <Badge count={idx + 1} style={{ backgroundColor: '#1890FF' }} />
                {s.title}
              </Space>
            }
            description={
              <>
                <Text>
                  <div dangerouslySetInnerHTML={{ __html: s.html }}></div>
                </Text>
                {/* {s.links && s.links} */}
              </>
            }
          />
        </Grid>
      ))}
    </Card>
  );
}

export default Instructions;
