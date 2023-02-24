import { Col, Row } from 'antd';
import { Dispatch, SetStateAction } from 'react';
import { Location } from 'common/models';
import { PersonalInfo, ContactInfo } from 'modules/Registry/components';

type Props = {
  location: Location | null;
  setLocation: Dispatch<SetStateAction<Location | null>>;
};

export function GeneralSection({ location, setLocation }: Props) {
  return (
    <Row justify="center" gutter={[0, 24]}>
      <Col span={24}>
        <PersonalInfo setLocation={setLocation} location={location} />
      </Col>
      <Col span={24}>
        <ContactInfo />
      </Col>
    </Row>
  );
}
