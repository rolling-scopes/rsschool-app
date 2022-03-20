import * as React from 'react';
import isEqual from 'lodash/isEqual';
import { List, Typography, Button, Tag } from 'antd';
import CommonCard from './CommonCard';
import MentorStatsModal from './MentorStatsModal';
import { MentorStats, Student } from 'common/models/profile';
import { ConfigurableProfilePermissions } from 'common/models/profile';
import { ChangedPermissionsSettings } from 'pages/profile';
import { CheckboxChangeEvent } from 'antd/lib/checkbox';
import { TeamOutlined, FullscreenOutlined } from '@ant-design/icons';

const { Text } = Typography;

type Props = {
  data: MentorStats[];
  isEditingModeEnabled: boolean;
  permissionsSettings?: ConfigurableProfilePermissions;
  onPermissionsSettingsChange: (event: CheckboxChangeEvent, settings: ChangedPermissionsSettings) => void;
};

type State = {
  courseIndex: number;
  isMentorStatsModalVisible: boolean;
};

class MentorStatsCard extends React.Component<Props, State> {
  state = {
    courseIndex: 0,
    isMentorStatsModalVisible: false,
  };

  private filterPermissions = ({ isMentorStatsVisible }: Partial<ConfigurableProfilePermissions>) => ({
    isMentorStatsVisible,
  });

  private showMentorStatsModal = (courseIndex: number) => {
    this.setState({ courseIndex, isMentorStatsModalVisible: true });
  };

  private hideMentortStatsModal = () => {
    this.setState({ isMentorStatsModalVisible: false });
  };

  private countStudents = (data: MentorStats[]) =>
    data.reduce((acc: Student[], cur: MentorStats) => (cur?.students?.length ? acc.concat(cur.students) : acc), [])
      .length;

  shouldComponentUpdate = (nextProps: Props, nextState: State) =>
    !isEqual(
      nextProps.permissionsSettings?.isMentorStatsVisible,
      this.props.permissionsSettings?.isMentorStatsVisible,
    ) ||
    !isEqual(nextProps.isEditingModeEnabled, this.props.isEditingModeEnabled) ||
    !isEqual(nextState.isMentorStatsModalVisible, this.state.isMentorStatsModalVisible);

  render() {
    const { isEditingModeEnabled, permissionsSettings, onPermissionsSettingsChange } = this.props;
    const stats = this.props.data;
    const { courseIndex, isMentorStatsModalVisible } = this.state;

    return (
      <>
        <MentorStatsModal
          stats={stats[courseIndex]}
          isVisible={isMentorStatsModalVisible}
          onHide={this.hideMentortStatsModal}
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
                    {this.countStudents(stats)}
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
                      <Button
                        style={{ marginLeft: 16 }}
                        type="dashed"
                        onClick={this.showMentorStatsModal.bind(null, idx)}
                      >
                        <FullscreenOutlined />
                      </Button>
                    )}
                  </List.Item>
                )}
              />
            </>
          }
          permissionsSettings={permissionsSettings ? this.filterPermissions(permissionsSettings) : undefined}
          isEditingModeEnabled={isEditingModeEnabled}
          onPermissionsSettingsChange={onPermissionsSettingsChange}
        />
      </>
    );
  }
}

export default MentorStatsCard;
