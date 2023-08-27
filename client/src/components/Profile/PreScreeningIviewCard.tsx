import * as React from 'react';
import { Typography, List, Button, Tag } from 'antd';
import CommonCard from './CommonCard';
import { StageInterviewDetailedFeedback } from 'common/models/profile';
import { formatDate } from 'services/formatter';
import { Rating } from 'components/Rating';
import PreScreeningIviewModal from './PreScreeningIviewModal';

const { Text } = Typography;

import { QuestionCircleOutlined, FullscreenOutlined } from '@ant-design/icons';
import { getRating } from 'domain/interview';

type Props = {
  data: StageInterviewDetailedFeedback[];
};

type State = {
  courseIndex: number;
  isPreScreeningIviewModalVisible: boolean;
};

class PreScreeningIviewsCard extends React.PureComponent<Props, State> {
  state = {
    courseIndex: 0,
    isPreScreeningIviewModalVisible: false,
  };

  private showPreScreeningIviewModal = (courseIndex: number) => {
    this.setState({ courseIndex, isPreScreeningIviewModalVisible: true });
  };

  private hidePreScreeningIviewModal = () => {
    this.setState({ isPreScreeningIviewModalVisible: false });
  };

  render() {
    const interviews = this.props.data;
    const { isPreScreeningIviewModalVisible, courseIndex } = this.state;
    const interviewResult = interviews[courseIndex];

    return (
      <>
        <PreScreeningIviewModal
          interviewResult={interviewResult}
          isVisible={isPreScreeningIviewModalVisible}
          onHide={this.hidePreScreeningIviewModal}
        />
        <CommonCard
          title="Pre-Screening Interviews"
          icon={<QuestionCircleOutlined />}
          content={
            <List
              itemLayout="horizontal"
              dataSource={interviews}
              renderItem={({ courseName, interviewer, score, maxScore, date, isGoodCandidate, version }, idx) => (
                <List.Item style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <div style={{ flexGrow: 2 }}>
                    <p style={{ marginBottom: 0 }}>
                      <Text strong>{courseName}</Text>
                    </p>
                    <Rating rating={getRating(score, maxScore, version)} />
                    <p style={{ fontSize: 12, marginBottom: 5 }}>Date: {formatDate(date)}</p>
                    {isGoodCandidate != null ? (
                      <p style={{ fontSize: 12, marginBottom: 5 }}>
                        Good candidate: {isGoodCandidate ? <Tag color="green">Yes</Tag> : <Tag color="red">No</Tag>}
                      </p>
                    ) : null}
                    <p style={{ fontSize: 12, marginBottom: 5 }}>
                      Interviewer: <a href={`/profile?githubId=${interviewer.githubId}`}>{interviewer.name}</a>
                    </p>
                  </div>
                  <Button type="dashed" onClick={this.showPreScreeningIviewModal.bind(null, idx)}>
                    <FullscreenOutlined />
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

export default PreScreeningIviewsCard;
