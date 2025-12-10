import { useMemo, useState } from 'react';
import { Button, Card, Flex, List, Space, Typography } from 'antd';
import CommonCard from './CommonCard';
import MentorStatsModal from './MentorStatsModal';
import { MentorStats, Student } from '@common/models/profile';
import { FileTextOutlined, TeamOutlined } from '@ant-design/icons';
import { MentorEndorsement } from 'modules/Profile/components/MentorEndorsement';
import { ExpandButtonWidget, ScoreWidget } from '@client/components/Profile/ui';

const { Text } = Typography;

type Props = {
  isAdmin?: boolean;
  githubId: string;
  data: MentorStats[];
};

export function MentorStatsCard(props: Props) {
  const [courseIndex, setCourseIndex] = useState(0);
  const [isMentorStatsModalVisible, setIsMentorStatsModalVisible] = useState(false);
  const [isEndorsementModalVisible, setIsEndorsementModalVisible] = useState(false);

  const showMentorStatsModal = (courseIndex: number) => {
    setCourseIndex(courseIndex);
    setIsMentorStatsModalVisible(true);
  };

  const hideMentorStatsModal = () => {
    setIsMentorStatsModalVisible(false);
  };

  const stats = props.data;
  const count = useMemo(
    () => props.data.reduce<Student[]>((acc, cur) => acc.concat(cur.students ?? []), []).length,
    [],
  );

  return (
    <>
      {stats[courseIndex] ? (
        <MentorStatsModal
          stats={stats[courseIndex]}
          isVisible={isMentorStatsModalVisible}
          onHide={hideMentorStatsModal}
        />
      ) : null}
      <MentorEndorsement
        onClose={() => setIsEndorsementModalVisible(false)}
        open={isEndorsementModalVisible}
        githubId={props.githubId}
      />
      <CommonCard
        title="Mentor Statistics"
        icon={<TeamOutlined />}
        content={
          <Flex vertical gap={8}>
            <Space>
              <Text>Mentored Students:</Text>
              <Text style={{ fontSize: 18 }} strong>
                {count}
              </Text>
            </Space>
            <Space>
              <Text>Courses as Mentor:</Text>
              <Text style={{ fontSize: 18 }} strong>
                {stats.length}
              </Text>
            </Space>
            {props.isAdmin ? (
              <Button
                style={{ marginBlock: 8 }}
                onClick={() => setIsEndorsementModalVisible(true)}
                icon={<FileTextOutlined />}
                type="primary"
              >
                Get Endorsement
              </Button>
            ) : null}
            {stats.map(({ courseName, courseLocationName, students }, idx) => (
              <Card
                key={courseName}
                type="inner"
                size="small"
                title={courseName}
                extra={students && <ExpandButtonWidget onClick={showMentorStatsModal.bind(null, idx)} />}
              >
                <Card.Meta
                  title={courseLocationName && ` / ${courseLocationName}`}
                  description={
                    students ? (
                      idx === 0 ? (
                        <List
                          itemLayout="horizontal"
                          dataSource={students}
                          split={false}
                          renderItem={({ githubId, name, totalScore }) => (
                            <List.Item key={`mentor-students-${githubId} ${courseName}`}>
                              <Flex vertical gap={8}>
                                <a href={`/profile?githubId=${githubId}`}>{name}</a> <ScoreWidget score={totalScore} />
                              </Flex>
                            </List.Item>
                          )}
                        />
                      ) : (
                        <Text>Students number: {students.length}</Text>
                      )
                    ) : (
                      <Text>Does not have students at this course yet</Text>
                    )
                  }
                />
              </Card>
            ))}
          </Flex>
        }
      />
    </>
  );
}
