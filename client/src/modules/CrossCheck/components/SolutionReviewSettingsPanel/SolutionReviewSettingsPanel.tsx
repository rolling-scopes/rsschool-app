import { Col, Row, Switch, Typography } from 'antd';
import { SolutionReviewSettings } from 'modules/CrossCheck/constants';

export type SolutionReviewSettingsPanelProps = {
  settings: SolutionReviewSettings;
};

function SolutionReviewSettingsPanel(props: SolutionReviewSettingsPanelProps) {
  const { settings } = props;
  const { areContactsVisible, setAreContactsVisible } = settings;

  const handleContactsVisibilityChange = () => {
    setAreContactsVisible(!areContactsVisible);
  };

  return (
    <Row gutter={8}>
      <Col>
        <Typography.Text>Contacts</Typography.Text>
      </Col>
      <Col>
        <Switch size={'small'} defaultChecked={areContactsVisible} onChange={handleContactsVisibilityChange} />
      </Col>
    </Row>
  );
}

export default SolutionReviewSettingsPanel;
