import isEqual from 'lodash/isEqual';
import { Typography, List, Button } from 'antd';
import CommonCard from './CommonCard';
import CoreJsIviewsModal from './CoreJsIviewsModal';
import { QuestionCircleOutlined, FullscreenOutlined } from '@ant-design/icons';
import { formatDate } from 'services/formatter';

const { Text } = Typography;

export interface CoreJsInterviewsData {
  courseFullName: string;
  courseName: string;
  locationName: string | null;
  interviews: {
    answers: {
      answer?: boolean;
      questionText: string;
      questionId: string;
    }[];
    interviewer: {
      name: string;
      githubId: string;
    };
    comment: string;
    score: number;
    name: string;
    interviewDate?: string;
  }[];
}

type Props = {
  data: CoreJsInterviewsData[];
};

type State = {
  courseIndex: number;
  interviewIndex: number;
  isCoreJsIviewModalVisible: boolean;
};

const CoreJSIviewsCard = (props: Props) => {
  const [courseIndex, setCourseIndex] = useState(0);
  const [interviewIndex, setInterviewIndex] = useState(0);
  const [isCoreJsIviewModalVisible, setIsCoreJsIviewModalVisible] = useState(false);

  const shouldComponentUpdateHandler = useCallback(
    (_: Props, nextState: State) => !isEqual(nextState.isCoreJsIviewModalVisible, isCoreJsIviewModalVisible),
    [isCoreJsIviewModalVisible],
  );
  const showCoreJsIviewModalHandler = useCallback(
    (courseIndex: number, interviewIndex: number) => {
      setCourseIndex(courseIndex);
      setIsCoreJsIviewModalVisible(true);
      setInterviewIndex(interviewIndex);
    },
    [courseIndex, interviewIndex],
  );
  const hideCoreJsIviewModalHandler = useCallback(() => {
    setIsCoreJsIviewModalVisible(false);
  }, []);

  const stats = props.data;

  return (
    <>
      <CoreJsIviewsModal
        stats={stats[courseIndex]}
        interviewIndex={interviewIndex}
        isVisible={isCoreJsIviewModalVisible}
        onHide={hideCoreJsIviewModalHandler}
      />
      <CommonCard
        title="CoreJS Interviews"
        icon={<QuestionCircleOutlined />}
        content={
          <List
            itemLayout="horizontal"
            dataSource={stats}
            renderItem={({ courseName, locationName, interviews }, idx) =>
              interviews.map(({ score, interviewer, name, interviewDate }, interviewIndex) => (
                <List.Item style={{ display: 'flex', justifyContent: 'space-between' }} key={interviewIndex}>
                  <div style={{ flexGrow: 2 }}>
                    <p style={{ marginBottom: 5 }}>
                      <Text strong>
                        {courseName}
                        {locationName && ` / ${locationName}`}
                      </Text>
                    </p>
                    <p style={{ marginBottom: 5 }}>{name}</p>
                    {
                      <p style={{ fontSize: 12, marginBottom: 5 }}>
                        Score: <Text mark>{score}</Text>
                      </p>
                    }
                    {interviewDate && (
                      <p style={{ fontSize: 12, marginBottom: 5 }}>Date: {formatDate(interviewDate)}</p>
                    )}
                    {
                      <p style={{ fontSize: 12, marginBottom: 5 }}>
                        Interviewer: <a href={`/profile?githubId=${interviewer.githubId}`}>{interviewer.name}</a>
                      </p>
                    }
                  </div>
                  <Button
                    data-testid="profile-corejs-iview-button"
                    type="dashed"
                    onClick={showCoreJsIviewModalHandler.bind(null, idx, interviewIndex)}
                  >
                    <FullscreenOutlined />
                  </Button>
                </List.Item>
              ))
            }
          />
        }
      />
    </>
  );
};

export default CoreJSIviewsCard;
