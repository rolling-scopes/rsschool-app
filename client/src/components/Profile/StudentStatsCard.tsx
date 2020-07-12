import * as React from 'react';
import isEqual from 'lodash/isEqual';
import { Typography, List, Button, Progress, Popconfirm } from 'antd';
import CommonCard from './CommonCard';
import StudentStatsModal from './StudentStatsModal';
import { StudentStats } from '../../../../common/models/profile';
import { ConfigurableProfilePermissions } from '../../../../common/models/profile';
import { ChangedPermissionsSettings } from 'pages/profile';
import { CheckboxChangeEvent } from 'antd/lib/checkbox';
import { BookOutlined, FullscreenOutlined, SafetyCertificateTwoTone } from '@ant-design/icons';
import { CourseService } from '../../services/course';

const { Text } = Typography;

type Props = {
  data: StudentStats[];
  isEditingModeEnabled: boolean;
  isProfileOwner: boolean | null;
  permissionsSettings?: ConfigurableProfilePermissions;
  onPermissionsSettingsChange: (event: CheckboxChangeEvent, settings: ChangedPermissionsSettings) => void;
  username: string;
};

type State = {
  courseIndex: number;
  coursesProgress: number[];
  scoredTasks: number[];
  isStudentStatsModalVisible: boolean;
};

class StudentStatsCard extends React.Component<Props, State> {
  state = {
    courseIndex: 0,
    coursesProgress: [],
    scoredTasks: [],
    isStudentStatsModalVisible: false,
  };

  shouldComponentUpdate = (nextProps: Props, nextState: State) =>
    !isEqual(
      nextProps.permissionsSettings?.isStudentStatsVisible,
      this.props.permissionsSettings?.isStudentStatsVisible,
    ) ||
    !isEqual(nextProps.isEditingModeEnabled, this.props.isEditingModeEnabled) ||
    !isEqual(nextState.isStudentStatsModalVisible, this.state.isStudentStatsModalVisible) ||
    !isEqual(nextState.coursesProgress, this.state.coursesProgress);

  private filterPermissions = ({ isStudentStatsVisible }: Partial<ConfigurableProfilePermissions>) => ({
    isStudentStatsVisible,
  });

  private showStudentStatsModal = (courseIndex: number) => {
    this.setState({ courseIndex, isStudentStatsModalVisible: true });
  };

  private hideStudentStatsModal = () => {
    this.setState({ isStudentStatsModalVisible: false });
  };

  private selfExpelStudent = async (gitHubId: string, courseId: number) => {
    const courseService = new CourseService(courseId);
    const result = await courseService.selfExpel(gitHubId, courseId.toString());
    if (result.status === 200) {
      window.location.reload();
    }
  };

  private countScoredTasks = (tasks: { score: number }[]) => tasks.filter(({ score }) => score !== null).length;
  private countCourseCompletionPercentage = (tasks: { score: number }[]) =>
    Number(((tasks.filter(({ score }) => score !== null).length / tasks.length) * 100).toFixed(1));

  componentDidMount() {
    const stats = this.props.data;
    const scoredTasks = stats.map(({ tasks }) => this.countScoredTasks(tasks));
    const coursesProgress = stats.map(({ tasks }) => this.countCourseCompletionPercentage(tasks));
    this.setState({ coursesProgress, scoredTasks });
  }

  render() {
    const { isEditingModeEnabled, permissionsSettings, onPermissionsSettingsChange, isProfileOwner } = this.props;
    const stats = this.props.data;
    const gitHubId: string = this.props.username;
    const { isStudentStatsModalVisible, courseIndex, coursesProgress, scoredTasks } = this.state;
    return (
      <>
        <StudentStatsModal
          stats={stats[courseIndex]}
          courseProgress={coursesProgress[courseIndex]}
          scoredTasks={scoredTasks[courseIndex]}
          isVisible={isStudentStatsModalVisible}
          onHide={this.hideStudentStatsModal}
        />
        <CommonCard
          title="Student Statistics"
          icon={<BookOutlined />}
          content={
            <List
              itemLayout="horizontal"
              dataSource={stats}
              renderItem={(
                {
                  courseName,
                  locationName,
                  mentor,
                  totalScore,
                  isExpelled,
                  position,
                  isCourseCompleted,
                  certificateId,
                  courseId,
                },
                idx,
              ) => (
                <List.Item style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <div style={{ flexGrow: 2 }}>
                    <p style={{ marginBottom: 0 }}>
                      <Text strong>
                        {courseName}
                        {locationName && ` / ${locationName}`}
                      </Text>
                    </p>
                    <div style={{ width: '80%', marginBottom: 5 }}>
                      <Progress
                        percent={coursesProgress.length ? coursesProgress[idx] : 0}
                        status={isExpelled ? 'exception' : isCourseCompleted ? 'success' : undefined}
                        size="small"
                      />
                    </div>
                    {certificateId && (
                      <p style={{ fontSize: 16, marginBottom: 5 }}>
                        <SafetyCertificateTwoTone twoToneColor="#52c41a" />{' '}
                        <a target="__blank" href={`/certificate/${certificateId}`}>
                          Certificate
                        </a>
                      </p>
                    )}
                    {mentor.githubId && (
                      <p style={{ fontSize: 12, marginBottom: 5 }}>
                        Mentor: <a href={`/profile?githubId=${mentor.githubId}`}>{mentor.name}</a>
                      </p>
                    )}
                    {position && (
                      <p style={{ fontSize: 12, marginBottom: 5 }}>
                        Position: <Text strong>{position}</Text>
                      </p>
                    )}
                    <p style={{ fontSize: 12, marginBottom: 5 }}>
                      Score: <Text mark>{totalScore}</Text>
                    </p>
                    {!(isExpelled || isCourseCompleted) && isProfileOwner ? (
                      <Popconfirm
                        onConfirm={() => this.selfExpelStudent(gitHubId, courseId)}
                        title="Are you sure you want to expel yourself from course?"
                      >
                        <a href="#">Self expel</a>
                      </Popconfirm>
                    ) : (
                      ''
                    )}
                  </div>
                  <Button type="dashed" onClick={this.showStudentStatsModal.bind(null, idx)}>
                    <FullscreenOutlined />
                  </Button>
                </List.Item>
              )}
            />
          }
          permissionsSettings={permissionsSettings ? this.filterPermissions(permissionsSettings) : undefined}
          isEditingModeEnabled={isEditingModeEnabled}
          onPermissionsSettingsChange={onPermissionsSettingsChange}
        />
      </>
    );
  }
}

export default StudentStatsCard;
