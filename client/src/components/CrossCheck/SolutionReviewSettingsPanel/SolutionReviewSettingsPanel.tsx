import { Col, Row, Switch, Typography } from 'antd';
import { SolutionReviewSettings } from '../hooks/useSolutionReviewSettings';

type Props = {
  settings: SolutionReviewSettings;
};

export function SolutionReviewSettingsPanel(props: Props) {
  const { settings } = props;
  const { areStudentContactsVisible, setAreStudentContactsHidden } = settings;

  const handleStudentContactsVisibilityChange = () => {
    setAreStudentContactsHidden(!areStudentContactsVisible);
  };

  return (
    <Row gutter={8}>
      <Col>
        <Typography.Text>Student Contacts</Typography.Text>
      </Col>
      <Col>
        <Switch
          size={'small'}
          defaultChecked={areStudentContactsVisible}
          onChange={handleStudentContactsVisibilityChange}
        />
      </Col>
    </Row>
  );
}
