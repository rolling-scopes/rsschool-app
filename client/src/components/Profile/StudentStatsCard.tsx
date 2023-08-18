
import isEqual from 'lodash/isEqual';
import { Typography, List, Button, Progress, Modal, Divider } from 'antd';
import CommonCard from './CommonCard';
import StudentStatsModal from './StudentStatsModal';
import { StudentStats } from 'common/models/profile';
import { BookOutlined, FullscreenOutlined, SafetyCertificateTwoTone } from '@ant-design/icons';
import { CoursesApi } from 'api';
import { WarningTwoTone, ReloadOutlined, LogoutOutlined } from '@ant-design/icons';

const { Text, Paragraph } = Typography;

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
};

const coursesService = new CoursesApi();

const messages = ['Are you sure you want to leave the course?', 'Your learning will be stopped.'];

const messagesRu = ['Вы уверены, что хотите покинуть курс?', 'Ваше обучение будет прекращено.'];

const StudentStatsCard = (props: Props) => {


    const [courseIndex, setCourseIndex] = useState(0);
    const [coursesProgress, setCoursesProgress] = useState([]);
    const [scoredTasks, setScoredTasks] = useState([]);
    const [isStudentStatsModalVisible, setIsStudentStatsModalVisible] = useState(false);
    const [isExpelConfirmationModalVisible, setIsExpelConfirmationModalVisible] = useState(false);

    const shouldComponentUpdateHandler = useCallback((_nextProps: Props, nextState: State) =>
    !isEqual(nextState.isStudentStatsModalVisible, isStudentStatsModalVisible) ||
    !isEqual(nextState.coursesProgress, coursesProgress), [isStudentStatsModalVisible, coursesProgress]);
    const showStudentStatsModalHandler = useCallback((courseIndex: number) => {
    setCourseIndex(courseIndex);
    setIsStudentStatsModalVisible(true);
  }, [courseIndex]);
    const showExpelConfirmationModalHandler = useCallback((courseId: number) => {
    

    const content = (
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
    );

    Modal.confirm({
      icon: <WarningTwoTone twoToneColor="red" />,
      title: 'Leaving Course ?',
      content: content,
      onOk: () => selfExpelStudentHandler(courseId),
      visible: isExpelConfirmationModalVisible,
      onCancel: () => hideExpelConfirmationModalHandler(),
      okButtonProps: { danger: true },
      okText: 'Leave Course',
      cancelText: 'Continue studying'
    });
  }, [isExpelConfirmationModalVisible]);
    const hideStudentStatsModalHandler = useCallback(() => {
    setIsStudentStatsModalVisible(false);
  }, []);
    const hideExpelConfirmationModalHandler = useCallback(() => {
    setIsExpelConfirmationModalVisible(false);
  }, []);
    const selfExpelStudentHandler = useCallback(async (courseId: number) => {
    await coursesService.leaveCourse(courseId);
    window.location.reload();
  }, []);
    const rejoinAsStudentHandler = useCallback(async (courseId: number) => {
    await coursesService.rejoinCourse(courseId);
    window.location.reload();
  }, []);
    const countScoredTasksHandler = useCallback((tasks: { score: number }[]) => tasks.filter(({ score }) => score !== null).length, []);
    const countCourseCompletionPercentageHandler = useCallback((tasks: { score: number }[]) =>
    Number(((tasks.filter(({ score }) => score !== null).length / tasks.length) * 100).toFixed(1)), []);
    useEffect(() => {
    const stats = props.data;
    const scoredTasks = stats.map(({ tasks }) => countScoredTasksHandler(tasks));
    const coursesProgress = stats.map(({ tasks }) => countCourseCompletionPercentageHandler(tasks));
    setCoursesProgress(coursesProgress);
    setScoredTasks(scoredTasks);
  }, [scoredTasks, coursesProgress]);

    const { isProfileOwner } = props;
    const stats = props.data;
    
    return (
      <>
        <StudentStatsModal
          stats={stats[courseIndex]}
          isVisible={isStudentStatsModalVisible}
          onHide={hideStudentStatsModalHandler}
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
                  isSelfExpelled,
                  certificateId,
                  courseId
                },
                idx
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
                            onClick={() => showExpelConfirmationModalHandler(courseId)}
                          >
                            Leave course
                          </Button>
                        ) : isSelfExpelled ? (
                          <Button
                            icon={<ReloadOutlined />}
                            danger
                            size="small"
                            onClick={() => rejoinAsStudentHandler(courseId)}
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
                    <Button type="dashed" onClick={showStudentStatsModalHandler.bind(null, idx)}>
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
};




export default StudentStatsCard;
