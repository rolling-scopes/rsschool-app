import * as React from 'react';
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
  locationName: string;
  interviews: {
    answers: {
      answer: string;
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

class CoreJSIviewsCard extends React.Component<Props, State> {
  state = {
    courseIndex: 0,
    interviewIndex: 0,
    isCoreJsIviewModalVisible: false,
  };

  shouldComponentUpdate = (_: Props, nextState: State) =>
    !isEqual(nextState.isCoreJsIviewModalVisible, this.state.isCoreJsIviewModalVisible);

  private showCoreJsIviewModal = (courseIndex: number, interviewIndex: number) => {
    this.setState({ courseIndex, isCoreJsIviewModalVisible: true, interviewIndex });
  };

  private hideCoreJsIviewModal = () => {
    this.setState({ isCoreJsIviewModalVisible: false });
  };

  render() {
    const stats = this.props.data;
    const { isCoreJsIviewModalVisible, interviewIndex } = this.state;
    const { courseIndex } = this.state;

    return (
      <>
        <CoreJsIviewsModal
          stats={stats[courseIndex]}
          interviewIndex={interviewIndex}
          isVisible={isCoreJsIviewModalVisible}
          onHide={this.hideCoreJsIviewModal}
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
                    <Button type="dashed" onClick={this.showCoreJsIviewModal.bind(null, idx, interviewIndex)}>
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
  }
}

export default CoreJSIviewsCard;
