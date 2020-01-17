import * as React from 'react';
import { StudentStats } from '../../../../common/models/profile';
import {
  Typography,
  List,
  Button,
  Progress,
} from 'antd';
import CommonCard from './CommonCard';
import StudentStatsModal from './StudentStatsModal';

const { Text } = Typography;

import {
  BookOutlined,
  FullscreenOutlined,
} from '@ant-design/icons';

type Props = {
  data: StudentStats[];
};

type State = {
  courseIndex: number;
  coursesProgress: number[];
  isStudentStatsModalVisible: boolean;
};

class StudentStatsCard extends React.Component<Props, State> {
  state = {
    courseIndex: 0,
    coursesProgress: [],
    isStudentStatsModalVisible: false,
  };

  private showStudentStatsModal = (courseIndex: number) => {
    this.setState({ courseIndex, isStudentStatsModalVisible: true });
  }

  private hideStudentStatsModal = () => {
    this.setState({ isStudentStatsModalVisible: false });
  }

  private countCourseCompletionPercentage = (tasks) => Number((tasks
    .filter(({ score }) => score !== null).length / tasks.length * 100)
    .toFixed(1));

  componentDidMount() {
    const stats = this.props.data;
    const coursesProgress = stats.map(({ tasks }) => this.countCourseCompletionPercentage(tasks));
    this.setState({ coursesProgress });
  }

  render() {
    const stats = this.props.data;
    const { isStudentStatsModalVisible, courseIndex, coursesProgress } = this.state;
    return (
      <>
        <StudentStatsModal
          stats={stats[courseIndex]}
          courseProgress={coursesProgress[courseIndex]}
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
                },
                idx,
              ) => (
                <List.Item style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <div style={{ flexGrow: 2 }}>
                    <p style={{ marginBottom: 0 }}>
                      <Text strong>{courseName}{locationName && ` / ${locationName}`}</Text>
                    </p>
                    <div style={{ width: '80%', marginBottom: 5 }}>
                      <Progress
                        percent={coursesProgress.length ? coursesProgress[idx] : 0}
                        status={isExpelled ? 'exception' : isCourseCompleted ? 'success' : undefined}
                        size="small"
                      />
                    </div>
                    {
                      mentor.githubId && <p style={{ fontSize: 12, marginBottom: 5 }}>
                        Mentor: <a href={`/profile?githubId=${mentor.githubId}`}>{mentor.name}</a>
                      </p>
                    }
                    {
                      position && <p style={{ fontSize: 12, marginBottom: 5 }}>
                        Position: <Text strong>{position}</Text>
                      </p>
                    }
                    <p style={{ fontSize: 12, marginBottom: 5 }}>Score: <Text mark>{totalScore}</Text></p>
                  </div>
                  <Button type="dashed" onClick={this.showStudentStatsModal.bind(null, idx)}>
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

export default StudentStatsCard;
