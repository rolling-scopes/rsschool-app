import { useMemo, useState } from 'react';
import { List, Typography, Button, Tag } from 'antd';
import CommonCard from './CommonCard';
import MentorStatsModal from './MentorStatsModal';
import { MentorStats, Student } from '@common/models/profile';
import { TeamOutlined, FullscreenOutlined, FileTextOutlined } from '@ant-design/icons';
import { MentorEndorsement } from 'modules/Profile/components/MentorEndorsement';

const { Text } = Typography;

type Props = {
  isAdmin?: boolean;
  githubId: string;
  data: MentorStats[];
};

export function MentorStatsCard(props: Props) {
  const [courseIndex, setCourseIndex] = useState(0);
  const [isMentorStatsModalVisible, setIsMentorStatsModalVisible] = useState(false);
  const [isEndorsmentModalVisible, setIsEndorsmentModalVisible] = useState(false);

  const showMentorStatsModal = (courseIndex: number) => {
    setCourseIndex(courseIndex);
    setIsMentorStatsModalVisible(true);
  };

  const hideMentortStatsModal = () => {
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
          onHide={hideMentortStatsModal}
        />
      ) : null}
      <MentorEndorsement
        onClose={() => setIsEndorsmentModalVisible(false)}
        open={isEndorsmentModalVisible}
        githubId={props.githubId}
      />
      <CommonCard
        title="Mentor Statistics"
        icon={<TeamOutlined />}
        content={
          <>
            <div>
              <p>
                Mentored Students:{' '}
                <Text style={{ fontSize: 18 }} strong>
                  {count}
                </Text>
              </p>
              <p>
                Courses as Mentor:{' '}
                <Text style={{ fontSize: 18 }} strong>
                  {stats.length}
                </Text>
              </p>
            </div>
            {props.isAdmin ? (
              <Button onClick={() => setIsEndorsmentModalVisible(true)} icon={<FileTextOutlined />} type="primary">
                Get Endorsment
              </Button>
            ) : null}
            <List
              itemLayout="horizontal"
              dataSource={stats}
              renderItem={({ courseName, courseLocationName, students }, idx) => (
                <List.Item style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <div style={{ flexGrow: 2 }}>
                    <p style={{ fontSize: idx === 0 ? 20 : undefined, marginBottom: 5 }}>
                      <Text strong>
                        {courseName}
                        {courseLocationName && ` / ${courseLocationName}`}
                      </Text>
                    </p>
                    {students ? (
                      idx === 0 && (
                        <List
                          itemLayout="horizontal"
                          dataSource={students}
                          renderItem={({ githubId, name, isExpelled, totalScore }) => (
                            <List.Item style={{ display: 'flex', justifyContent: 'space-between' }}>
                              <div key={`mentor-students-${githubId} ${courseName}`} style={{ width: '100%' }}>
                                <p
                                  style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    fontSize: 12,
                                    marginBottom: 5,
                                  }}
                                >
                                  <a href={`/profile?githubId=${githubId}`}>{name}</a>{' '}
                                  {isExpelled ? <Tag color="red">expelled</Tag> : <Tag color="green">active</Tag>}
                                </p>
                                <p style={{ fontSize: 12, marginBottom: 0 }}>
                                  Score: <Text mark>{totalScore}</Text>
                                </p>
                              </div>
                            </List.Item>
                          )}
                        />
                      )
                    ) : (
                      <p>Does not have students at this course yet</p>
                    )}
                  </div>
                  {students && (
                    <Button style={{ marginLeft: 16 }} type="dashed" onClick={showMentorStatsModal.bind(null, idx)}>
                      <FullscreenOutlined />
                    </Button>
                  )}
                </List.Item>
              )}
            />
          </>
        }
      />
    </>
  );
}
