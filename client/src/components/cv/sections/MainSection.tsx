import * as React from 'react';
import { Row, Col, Typography } from 'antd';
import SectionCV from '../SectionCV';
import ContactsListCV from '../ContactsListCV';
import AvatarCV from '../AvatarCV';
import { Contacts, UserData } from '../../../../../common/models/cv';

const { Title, Text } = Typography;

type Props = {
  userData: UserData;
  contacts: Contacts;
  expires: number | null;
}

function formatDate(expirationValue: number | null) {
  if (expirationValue === null) {
    return 'CV expiration date is not set';
  } else {
    const expirationDate = new Date(expirationValue);
    const addZeroPadding = (num: number) => `0${num}`.slice(-2);
    const [year, month, date] = [expirationDate.getFullYear(), expirationDate.getMonth() + 1, expirationDate.getDate()];
    const expirationDateFormatted = `${year}-${addZeroPadding(month)}-${addZeroPadding(date)}`;
    return `CV expiration date: ${expirationDateFormatted}`;
  }
}

function MainSection(props: Props) {
  const { userData, contacts, expires } = props;
  const { avatarLink, name, desiredPosition, englishLevel, militaryService, selfIntroLink, startFrom, fullTime, } = userData;

  const sectionContent = (
    <Row>
      <Col flex={4} style={{ minWidth: '120px' }}>
        <AvatarCV src={avatarLink} />
        <br />
        <br />
        <Text>English level: <Text strong>{englishLevel}</Text></Text>
        <br />
        {militaryService && <Text>Military service: <Text strong>{militaryService}</Text> </Text>}
        <br />
        {selfIntroLink && (
          <>
            <a className='hide-on-print' href={selfIntroLink}>Self introduction video</a>
            <br className='hide-on-print' />
          </>
        )}
        <Text>Ready to work full time: <Text strong>{fullTime ? 'yes' : 'no'}</Text></Text>
        <br />
        {startFrom && <time dateTime={startFrom}>Ready to work from <Text strong>{startFrom}</Text></time>}
      </Col>
      <Col flex={14}>
        <Title level={2}>{name}</Title>
        <Text>{desiredPosition}</Text>
      </Col>
      <Col flex={6}>
        <ContactsListCV contacts={contacts} />
      </Col>
    </Row>
  );
  return <SectionCV title={formatDate(expires)} content={sectionContent} />;
}

export default MainSection;
