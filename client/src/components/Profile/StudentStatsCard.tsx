import * as React from 'react';
import isEqual from 'lodash/isEqual';
import { Typography, List, Button, Progress, Modal, Divider } from 'antd';
import CommonCard from './CommonCard';
import StudentStatsModal from './StudentStatsModal';
import { StudentStats } from '@common/models/profile';
import {
  BookOutlined,
  FullscreenOutlined,
  LogoutOutlined,
  ReloadOutlined,
  SafetyCertificateTwoTone,
  WarningTwoTone,
} from '@ant-design/icons';
import { CoursesApi } from 'api';

const { Text, Paragraph, Title } = Typography;

type Props = {
  data: StudentStats[];
  isProfileOwner: boolean;
  username: string;
};

type State = {
  courseIndex: number;
  coursesProgress: number[];
  scoredTasks: number[];
  isStudentStatsModalVisible: boolean;
  isExpelConfirmationModalVisible: boolean;
  courseId?: number;
};

const coursesService = new CoursesApi();

const messages = ['Are you sure you want to leave the course?', 'Your learning will be stopped.'];

const messagesRu = ['Вы уверены, что хотите покинуть курс?', 'Ваше обучение будет прекращено.'];

class StudentStatsCard extends React.Component<Props, State> {
  state = {
    courseIndex: 0,
    coursesProgress: [],
    scoredTasks: [],
    isStudentStatsModalVisible: false,
    isExpelConfirmationModalVisible: false,
    courseId: undefined,
  };

  shouldComponentUpdate = (_nextProps: Props, nextState: State) =>
    !isEqual(nextState.isStudentStatsModalVisible, this.state.isStudentStatsModalVisible) ||
    !isEqual(nextState.isExpelConfirmationModalVisible, this.state.isExpelConfirmationModalVisible) ||
    !isEqual(nextState.coursesProgress, this.state.coursesProgress);

  private showStudentStatsModal = (courseIndex: number) => {
    this.setState({ courseIndex, isStudentStatsModalVisible: true });
  };

  private showExpelConfirmationModal = (courseId: number) => {
    this.setState({
      isExpelConfirmationModalVisible: true,
      courseId,
    });
  };

  private hideStudentStatsModal = () => {
    this.setState({ isStudentStatsModalVisible: false });
  };

  private hideExpelConfirmationModal = () => {
    this.setState({
      isExpelConfirmationModalVisible: false,
      courseId: undefined,
    });
  };

  private selfExpelStudent = async (courseId?: number) => {
    if (!courseId) return;
    await coursesService.leaveCourse(courseId);
    window.location.reload();
  };

  private rejoinAsStudent = async (courseId: number) => {
    await coursesService.rejoinCourse(courseId);
    window.location.reload();
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
    const { isProfileOwner } = this.props;
    const stats = this.props.data;
    const { isStudentStatsModalVisible, courseIndex, coursesProgress } = this.state;
    return (
      <>
        <StudentStatsModal
          stats={stats[courseIndex]}
          isVisible={isStudentStatsModalVisible}
          onHide={this.hideStudentStatsModal}
        />
        <Modal
          title={
            <Title level={4}>
              <WarningTwoTone twoToneColor="red" /> Leaving Course ?
            </Title>
          }
          open={this.state.isExpelConfirmationModalVisible}
          onOk={this.selfExpelStudent.bind(this, this.state.courseId)}
          okText="Leave Course"
          okButtonProps={{ danger: true }}
          onCancel={this.hideExpelConfirmationModal}
          cancelText="Continue studying"
        >
          <>
            <Divider />
            {messages.map((text, i) => (
              <Paragraph key={i}>{text}</Paragraph>
            ))}
            <Divider />
            {messagesRu.map((text, i) => (
              <Paragraph key={i}>{text}</Paragraph>
            ))}
          </>
        </Modal>
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
                  isSelfExpelled,
                  certificateId,
                  courseId,
                },
                idx,
              ) => {
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
                      {rank && <p style={{ fontSize: 12, marginBottom: 5 }}>Position: {rank}</p>}
                      <p style={{ fontSize: 12, marginBottom: 5 }}>Score: {totalScore}</p>

                      {isProfileOwner && !isCourseCompleted ? (
                        !isExpelled ? (
                          <Button
                            icon={<LogoutOutlined />}
                            danger
                            size="small"
                            onClick={() => this.showExpelConfirmationModal(courseId)}
                          >
                            Leave course
                          </Button>
                        ) : isSelfExpelled ? (
                          <Button
                            icon={<ReloadOutlined />}
                            danger
                            size="small"
                            onClick={() => this.rejoinAsStudent(courseId)}
                          >
                            Back to Course
                          </Button>
                        ) : (
                          <Text mark>You expelled by Course Manager or Mentor</Text>
                        )
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
        />
      </>
    );
  }
}

export default StudentStatsCard;
