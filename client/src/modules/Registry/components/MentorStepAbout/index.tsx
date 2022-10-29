import { Button, Col, Row, Typography } from 'antd';
import { SolidarityUkraine } from 'components/SolidarityUkraine';
import { DEFAULT_COLUMN_SIZES } from 'modules/Registry/constants';
import css from 'styled-jsx/css';
import { MentorStep } from '../MentorStep';

type Props = {
  onNext: () => void;
};

export function MentorStepAbout(props: Props) {
  const header = (
    <>
      <p className="rss-logo-descriptions">Free courses from the developer community</p>
      <style jsx>{styles}</style>
    </>
  );

  const mentorshipItems = [
    'Duration: 10-13 weeks',
    'Responsibilities: check practical tasks completion, code review, provide feedback, answer questions, do consulting (on career growth, etc.)',
    'Start date: depends on the course',
    'Expected workload: 3-5 hours a week, depending on the number of students in your group',
    'Fully remote',
    'In case of vacations, BTs and others, you can reschedule/get other mentor’s help',
    'The main course language is English, but any other language acceptable for a mentor-student communication',
    'All our courses are mentee driven - that means the responsibility to do tasks and learn necessary materials is on a mentee, while the main purpose of a mentor is to help with difficult situations, do consulting, and check practical tasks completion.',
  ];

  const benefitsItems = [
    "Mentor's T-Shirt",
    'Mentoring experience',
    'Interviewing experience',
    'Team leadership experience',
    'Opportunity to hire mentees',
    'Networking and collaboration',
  ];

  return (
    <MentorStep header={header} title="About mentorship">
      <SolidarityUkraine />
      <Row>
        <Col {...DEFAULT_COLUMN_SIZES}>
          <Typography.Paragraph style={{ fontSize: 14, marginBottom: 32, marginTop: 15 }}>
            <ul>
              {mentorshipItems.map(item => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <Typography.Title level={3}>Benefits</Typography.Title>
            <ul>
              {benefitsItems.map(item => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </Typography.Paragraph>
        </Col>
      </Row>
      <Button size="large" type="primary" onClick={() => props.onNext()}>
        Register
      </Button>
    </MentorStep>
  );
}

const styles = css`
  .rss-logo-descriptions {
    margin: 32px 24px 0 24px;
    padding: 4px 0;
    font-size: 14px;
    font-weight: 700;
    background-color: #ffec3d;
    text-align: center;
  }
  @media (max-width: 575px) {
    .rss-logo-descriptions {
      margin: 0 16px 16px;
    }
  }
`;
