import * as React from 'react';
import {
  Typography,
  List,
  Button,
} from 'antd';
import CommonCard from './CommonCard';
import CoreJsIviewsModal from './CoreJsIviewsModal';

const { Text } = Typography;

import {
  QuestionCircleOutlined,
  FullscreenOutlined,
} from '@ant-design/icons';

export interface CoreJsInterviewData {
  courseFullName: string;
  courseName: string;
  locationName: string;
  interview: {
    answers: {
      answer: string;
      questionText: string;
      questionId: string;
    }[];
    interviewer: {
      name: string;
      githubId: string;
    }
    comment: string;
    score: number;
  };
};

type Props = {
  data: CoreJsInterviewData[];
};

type State = {
  courseIndex: number;
  isCoreJsIviewModalVisible: boolean;
};

class CoreJSIviewsCard extends React.PureComponent<Props, State> {
  state = {
    courseIndex: 0,
    isCoreJsIviewModalVisible: false,
  };

  private showCoreJsIviewModal = (courseIndex: number) => {
    this.setState({ courseIndex, isCoreJsIviewModalVisible: true });
  }

  private hideCoreJsIviewModal = () => {
    this.setState({ isCoreJsIviewModalVisible: false });
  }

  render() {
    const stats = this.props.data;
    const { isCoreJsIviewModalVisible } = this.state;
    const { courseIndex } = this.state;

    return (
      <>
        <CoreJsIviewsModal
          stats={stats[courseIndex]}
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
              renderItem={(
                {
                  courseName,
                  locationName,
                  interview: {
                    score,
                    interviewer,
                  },
                },
                idx,
              ) => (
                <List.Item style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <div style={{ flexGrow: 2 }}>
                    <p style={{ marginBottom: 5 }}>
                      <Text strong>{courseName}{locationName && ` / ${locationName}`}</Text>
                    </p>
                    {
                      <p style={{ fontSize: 12, marginBottom: 5 }}>
                        Score: <Text mark>{score}</Text>
                      </p>
                    }
                    {
                      <p style={{ fontSize: 12, marginBottom: 5 }}>
                        Interviewer: <a href={`/profile?githubId=${interviewer.githubId}`}>{interviewer.name}</a>
                      </p>
                    }
                  </div>
                  <Button type="dashed" onClick={this.showCoreJsIviewModal.bind(null, idx)}>
                    <FullscreenOutlined/>
                  </Button>
                </List.Item>
              )}
            />
          }
        />
      </>
    );
  }
}

export default CoreJSIviewsCard;
