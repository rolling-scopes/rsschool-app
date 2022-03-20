import { Badge, Card, Col, List, Typography } from 'antd';
import { FeedbackDto, FeedbackSoftSkillIdEnum } from 'api';
import * as React from 'react';
import { DataTextValue } from './DataTextValue';
import Section from './Section';

const { Text, Paragraph } = Typography;

type Props = {
  data: FeedbackDto[] | null;
};

export function FeedbackSection({ data }: Props) {
  if (!data?.length) {
    return null;
  }

  return (
    <Section title="Mentor's Feedback">
      <List
        dataSource={data}
        size="small"
        renderItem={({ recommendationComment, suggestions, softSkills, englishLevel, course, mentor }, i) => (
          <List.Item key={i}>
            <Col flex={1} style={{ paddingRight: 16 }}>
              <Badge.Ribbon text="Recommend To Hire" color="green">
                <Card
                  bordered={false}
                  title={
                    <DataTextValue>
                      <div>
                        Mentor:{' '}
                        <a className="black-on-print" href={`https://github.com/${mentor.githubId}`}>
                          {mentor.name}
                        </a>
                      </div>
                      <div>Course: {course.name}</div>
                    </DataTextValue>
                  }
                  size="small"
                >
                  <Paragraph italic>{recommendationComment}</Paragraph>
                  <Text type="secondary">Suggestions</Text>
                  <Paragraph italic>{suggestions}</Paragraph>

                  <Text type="secondary">Estimated English Level</Text>
                  <Paragraph italic>{englishLevel?.toUpperCase()}</Paragraph>

                  <Text type="secondary">Soft Skills</Text>
                  <Paragraph italic>
                    <ul>
                      {softSkills.map(skill => (
                        <li>
                          {formatSoftSkill(skill.id)}: {skill.value}
                        </li>
                      ))}
                    </ul>
                  </Paragraph>
                </Card>
              </Badge.Ribbon>
            </Col>
          </List.Item>
        )}
      />
    </Section>
  );
}

function formatSoftSkill(skillId: FeedbackSoftSkillIdEnum) {
  switch (skillId) {
    case FeedbackSoftSkillIdEnum.Communicable:
      return 'Communication';
    case FeedbackSoftSkillIdEnum.Responsible:
      return 'Responsibility';
    case FeedbackSoftSkillIdEnum.TeamPlayer:
      return 'Team Player';
    default:
      return 'Unknown';
  }
}
