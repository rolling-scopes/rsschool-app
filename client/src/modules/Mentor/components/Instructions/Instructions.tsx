import React, { useEffect, useState } from 'react';
import { Badge, Card, Col, Row, Space, Typography } from 'antd';
import { INSTRUCTIONS_TEXT, renderDescription, renderSocialLinks } from '.';
import { DiscordServersApi } from 'api';

interface InstructionsProps {
  discordServerId: number;
}

const { Meta, Grid } = Card;
const { Text } = Typography;

const discordServer = new DiscordServersApi();

function Instructions({ discordServerId }: InstructionsProps) {
  const { title, description } = INSTRUCTIONS_TEXT;
  const [steps, setSteps] = useState(INSTRUCTIONS_TEXT.steps);

  useEffect(() => {
    if (!discordServerId) return;

    const updateTelegramLink = async () => {
      const response = await discordServer.getDiscordServerById(discordServerId);
      const telegramInviteURL = response.data;

      const updatedSteps = steps.map(step => {
        if (!step.links) return step;

        const updatedLinks = step.links.map(link =>
          link.title === 'telegram' ? { ...link, url: telegramInviteURL } : link,
        );

        return { ...step, links: updatedLinks };
      });

      setSteps(updatedSteps);
    };

    updateTelegramLink();
  }, []);

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
                    <Badge count={idx + 1} style={{ backgroundColor: '#1677ff' }} />
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
