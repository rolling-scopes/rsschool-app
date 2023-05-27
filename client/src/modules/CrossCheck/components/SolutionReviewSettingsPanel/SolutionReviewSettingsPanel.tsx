import { Col, Row, Switch, Typography } from 'antd';
import { SolutionReviewSettings } from 'modules/CrossCheck/constants';

const { Text } = Typography;

export type SolutionReviewSettingsPanelProps = {
  settings: SolutionReviewSettings;
};

function SolutionReviewSettingsPanel(props: SolutionReviewSettingsPanelProps) {
  const { settings } = props;
  const { areContactsVisible, setAreContactsVisible } = settings;

  const handleContactsVisibilityChange = () => {
    setAreContactsVisible && setAreContactsVisible(!areContactsVisible);
  };

  return (
    <Row gutter={8}>
      <Col>
        <Text>Contacts</Text>
      </Col>
      <Col>
        <Switch size={'small'} defaultChecked={areContactsVisible} onChange={handleContactsVisibilityChange} />
      </Col>
    </Row>
  );
}

export default SolutionReviewSettingsPanel;
