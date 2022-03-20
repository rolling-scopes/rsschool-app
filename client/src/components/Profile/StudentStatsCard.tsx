import * as React from 'react';
import isEqual from 'lodash/isEqual';
import random from 'lodash/random';
import { Typography, List, Button, Progress, Modal, Input, Divider } from 'antd';
import CommonCard from './CommonCard';
import StudentStatsModal from './StudentStatsModal';
import { StudentStats } from 'common/models/profile';
import { ConfigurableProfilePermissions } from 'common/models/profile';
import { ChangedPermissionsSettings } from 'pages/profile';
import { CheckboxChangeEvent } from 'antd/lib/checkbox';
import { BookOutlined, FullscreenOutlined, SafetyCertificateTwoTone } from '@ant-design/icons';
import { CourseService } from '../../services/course';
import { WarningTwoTone } from '@ant-design/icons';
import { CSSProperties } from 'react';

const { Text, Paragraph } = Typography;

type Props = {
  data: StudentStats[];
  isEditingModeEnabled: boolean;
  isProfileOwner: boolean;
  permissionsSettings?: ConfigurableProfilePermissions;
  onPermissionsSettingsChange: (event: CheckboxChangeEvent, settings: ChangedPermissionsSettings) => void;
  username: string;
};

type State = {
  courseIndex: number;
  coursesProgress: number[];
  scoredTasks: number[];
  isStudentStatsModalVisible: boolean;
  isExpelConfirmationModalVisible: boolean;
};

class StudentStatsCard extends React.Component<Props, State> {
  state = {
    courseIndex: 0,
    coursesProgress: [],
    scoredTasks: [],
    isStudentStatsModalVisible: false,
    isExpelConfirmationModalVisible: false,
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

  private showExpelConfirmationModal = (gitHubId: string, courseId: number) => {
    const { isExpelConfirmationModalVisible } = this.state;

    const keyLength = 8;

    let key = '';

    for (let i = 0; i < keyLength; i++) key += random(0, 9);

    const title = (
      <Typography.Title level={3} style={{ textAlign: 'center' }}>
        <WarningTwoTone twoToneColor="#fcbe03" /> <Text strong>Are you sure?</Text>
        <WarningTwoTone twoToneColor="#fcbe03" />
      </Typography.Title>
    );

    const checkKeyMatch = (e: any) => {
      if (e.target.value === key) {
        modal.update({
          okButtonProps: { disabled: false },
        });
      } else {
        modal.update({
          okButtonProps: { disabled: true },
        });
      }
    };

    const message =
      "Are you sure you want to leave the course? Your learning will be finished. You won't be able to return to the course on your own.";
    const messageRu =
      'Вы уверены, что хотите покинуть курс? Ваше обучение будет окончено. Вы не сможете вернуться на курс самостоятельно.';

    const textStyle: CSSProperties = { textAlign: 'center' };

    const content = (
      <>
        <Paragraph style={textStyle} underline strong>
          {message}
        </Paragraph>
        <Paragraph style={textStyle} underline strong>
          {messageRu}
        </Paragraph>
        <Divider plain style={{ whiteSpace: 'normal' }}>
          Enter following number to confirm action: <Text strong>{key}</Text>
        </Divider>
        <Input placeholder="Enter the number" type="text" onChange={checkKeyMatch} />
      </>
    );

    const modal = Modal.confirm({
      maskStyle: { backgroundColor: 'red' },
      icon: null,
      title: title,
      content: content,
      centered: true,
      onOk: () => this.selfExpelStudent(gitHubId, courseId),
      visible: isExpelConfirmationModalVisible,
      onCancel: () => this.hideExpelConfirmationModal(),
      okButtonProps: { disabled: true },
      maskClosable: true,
    });
  };

  private hideStudentStatsModal = () => {
    this.setState({ isStudentStatsModalVisible: false });
  };

  private hideExpelConfirmationModal = () => {
    this.setState({ isExpelConfirmationModalVisible: false });
  };

  private selfExpelStudent = async (gitHubId: string, courseId: number) => {
    const courseService = new CourseService(courseId);
    const result = await courseService.selfExpel(gitHubId, 'Self expelled from the course');
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
                  rank,
                  isCourseCompleted,
                  certificateId,
                  courseId,
                },
                idx,
              ) => {
                const isActive = !(isExpelled || isCourseCompleted);
                return (
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
                      {rank && (
                        <p style={{ fontSize: 12, marginBottom: 5 }}>
                          Position: <Text strong>{rank}</Text>
                        </p>
                      )}
                      <p style={{ fontSize: 12, marginBottom: 5 }}>
                        Score: <Text mark>{totalScore}</Text>
                      </p>

                      {isActive && isProfileOwner ? (
                        <Button danger size="small" onClick={() => this.showExpelConfirmationModal(gitHubId, courseId)}>
                          Leave course
                        </Button>
                      ) : (
                        ''
                      )}
                    </div>
                    <Button type="dashed" onClick={this.showStudentStatsModal.bind(null, idx)}>
                      <FullscreenOutlined />
                    </Button>
                  </List.Item>
                );
              }}
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
