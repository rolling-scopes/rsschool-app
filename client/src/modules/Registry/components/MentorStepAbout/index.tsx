import { Button, Col, Row, Typography } from 'antd';
import { SolidarityUkraine } from 'components/SolidarityUkraine';
import { DEFAULT_COLUMN_SIZES, DEFAULT_ROW_GUTTER } from 'modules/Registry/constants';
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
  return (
    <MentorStep header={header} title="About mentorship">
      <SolidarityUkraine />
      <Row gutter={DEFAULT_ROW_GUTTER}>
        <Col {...DEFAULT_COLUMN_SIZES}>
          <Typography.Paragraph style={{ fontSize: 14, marginBottom: 32, marginTop: 15 }}>
            You are required to mentor students (from 2 to 6) and coach them 4-8 hours a week (or more, if you wish).
            Mentoring topics - html/css/vanillajs. You can teach them remotely.
          </Typography.Paragraph>
        </Col>
      </Row>

      <Row>
        <Typography.Title level={4}>Responsibilities:</Typography.Title>
      </Row>

      <Row gutter={DEFAULT_ROW_GUTTER}>
        <Col {...DEFAULT_COLUMN_SIZES}>
          <Typography.Paragraph style={{ fontSize: 14, marginTop: 10 }}>
            As a mentor you will meet weekly with your group of students in any messenger that is convenient for you,
            answer questions and share your experience.
          </Typography.Paragraph>

          <Typography.Paragraph style={{ fontSize: 14, marginBottom: 40 }}>
            It will also be necessary to check and evaluate student’s work (about 7 tasks), conduct training interviews
            (2 for each student) and give additional lectures (if you wish).
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
