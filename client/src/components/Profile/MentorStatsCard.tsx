
import isEqual from 'lodash/isEqual';
import { List, Typography, Button, Tag } from 'antd';
import CommonCard from './CommonCard';
import MentorStatsModal from './MentorStatsModal';
import { MentorStats, Student } from 'common/models/profile';
import { TeamOutlined, FullscreenOutlined } from '@ant-design/icons';

const { Text } = Typography;

type Props = {
  data: MentorStats[];
};

type State = {
  courseIndex: number;
  isMentorStatsModalVisible: boolean;
};

const MentorStatsCard = (props: Props) => {


    const [courseIndex, setCourseIndex] = useState(0);
    const [isMentorStatsModalVisible, setIsMentorStatsModalVisible] = useState(false);

    const showMentorStatsModalHandler = useCallback((courseIndex: number) => {
    setCourseIndex(courseIndex);
    setIsMentorStatsModalVisible(true);
  }, [courseIndex]);
    const hideMentortStatsModalHandler = useCallback(() => {
    setIsMentorStatsModalVisible(false);
  }, []);
    const countStudentsHandler = useCallback((data: MentorStats[]) =>
    data.reduce((acc: Student[], cur: MentorStats) => (cur?.students?.length ? acc.concat(cur.students) : acc), [])
      .length, []);
    const shouldComponentUpdateHandler = useCallback((_nextProps: Props, nextState: State) =>
    !isEqual(nextState.isMentorStatsModalVisible, isMentorStatsModalVisible), [isMentorStatsModalVisible]);

    const stats = props.data;
    

    return (
      <>
        <MentorStatsModal
          stats={stats[courseIndex]}
          isVisible={isMentorStatsModalVisible}
          onHide={hideMentortStatsModalHandler}
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
                    {countStudentsHandler(stats)}
                  </Text>
                </p>
                <p>
                  Courses as Mentor:{' '}
                  <Text style={{ fontSize: 18 }} strong>
                    {stats.length}
                  </Text>
                </p>
              </div>
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
                                      marginBottom: 5
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
                      <Button
                        style={{ marginLeft: 16 }}
                        type="dashed"
                        onClick={showMentorStatsModalHandler.bind(null, idx)}
                      >
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
};




export default MentorStatsCard;
