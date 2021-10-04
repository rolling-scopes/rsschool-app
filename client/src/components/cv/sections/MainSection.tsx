import * as React from 'react';
import { Row, Col, Typography, List } from 'antd';
import SectionCV from '../SectionCV';
import ContactsListCV from '../ContactsListCV';
import AvatarCV from '../AvatarCV';
import { Contacts, MilitaryServiceStatus, UserData } from '../../../../../common/models/cv';
import moment from 'moment';
import capitalize from 'lodash/capitalize';

const { Title, Text } = Typography;

type Props = {
  userData: UserData;
  contacts: Contacts;
  expires: number | null;
};

const formatDate = (expirationValue: number | null) => {
  if (expirationValue === null || expirationValue === 0) {
    return 'Not Set';
  }
  return moment(expirationValue).format('YYYY-MM-DD');
};

const militaryServiceDictionary: {
  [key in MilitaryServiceStatus]: string;
} = {
  served: 'served',
  notLiable: 'not liable',
  liable: 'liable',
};

function MainSection(props: Props) {
  const { userData, contacts, expires } = props;
  const { avatarLink, name, desiredPosition, englishLevel, militaryService, selfIntroLink, startFrom, fullTime } =
    userData;

  const data: {
    label: string;
    value: string | number | null;
    format?: (value: any) => string;
  }[] = [];

  data.push({ label: 'English level', value: englishLevel });
  data.push({
    label: 'Military service',
    value: militaryService ? capitalize(militaryServiceDictionary[militaryService]) : 'Not Available',
  });
  data.push({ label: 'Self introduction video', value: selfIntroLink ?? 'Not Available' });
  data.push({ label: 'Ready to work full time', value: fullTime ? 'Yes' : 'No' });
  data.push({ label: 'Ready to work from', value: startFrom });
  data.push({ label: 'CV Expiration', value: expires, format: formatDate });

  const sectionContent = (
    <Col>
      <Row>
        <Col flex={4} style={{ minWidth: 100, maxWidth: 120 }}>
          <AvatarCV src={avatarLink} />
        </Col>
        <Col flex={14}>
          <Title level={2}>{name}</Title>
          <Text>{desiredPosition}</Text>
        </Col>
        <Col flex={6}></Col>
      </Row>
      <Row justify="space-between" style={{ paddingTop: 16 }}>
        <Col flex={1}>
          <List
            size="small"
            dataSource={data}
            renderItem={(item, i) => {
              return (
                <List.Item key={i}>
                  <Col>{item.label}:</Col>
                  <Col>{item.format?.(item.value) ?? item.value}</Col>
                </List.Item>
              );
            }}
          />
        </Col>
        <Col flex={1} style={{ paddingLeft: 8, paddingRight: 8 }}>
          <ContactsListCV contacts={contacts} />
        </Col>
      </Row>
    </Col>
  );
  return <SectionCV content={sectionContent} />;
}

export default MainSection;
