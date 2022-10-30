import { Col, Row, Switch, Typography } from 'antd';
import { SolutionReviewSettings } from 'modules/CrossCheck/constants';

type Props = {
  settings: SolutionReviewSettings;
};

export function SolutionReviewSettingsPanel(props: Props) {
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
