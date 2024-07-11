import { Avatar, Col, Collapse, List, Row, Space, Typography } from 'antd';
import GithubFilled from '@ant-design/icons/GithubFilled';
import MailOutlined from '@ant-design/icons/MailOutlined';
import LinkedinOutlined from '@ant-design/icons/LinkedinOutlined';
import SkypeOutlined from '@ant-design/icons/SkypeOutlined';
import PhoneOutlined from '@ant-design/icons/PhoneOutlined';
import SendOutlined from '@ant-design/icons/SendOutlined';
import { DiscordOutlined } from 'components/Icons/DiscordOutlined';
import { GithubAvatar } from 'components/GithubAvatar';
import { UserStudentDto } from 'api';
import { CourseItem } from '../CourseItem';

type Props = {
  student: UserStudentDto;
};

const { Panel } = Collapse;

const { Text } = Typography;

export function StudentInfo(props: Props) {
  const { student } = props;
  const { githubId, fullName } = student;
  const hasName = fullName && fullName !== '(Empty)';
  const location = [student.city, student.country].filter(Boolean).join(', ');

  const UserContacts = (student: UserStudentDto) => {
    const contacts = [
      { type: 'Email', value: student.contactsEmail, icon: <MailOutlined /> },
      { type: 'Telegram', value: student.contactsTelegram, icon: <SendOutlined rotate={-45} /> },
      { type: 'LinkedIn', value: student.contactsLinkedIn, icon: <LinkedinOutlined /> },
      { type: 'Skype', value: student.contactsSkype, icon: <SkypeOutlined /> },
      { type: 'Phone', value: student.contactsPhone, icon: <PhoneOutlined /> },
      { type: 'Discord', value: student.discord?.username, icon: <DiscordOutlined /> },
    ];
    return contacts.filter(contact => contact.value);
  };

  return (
    <Space direction="vertical" style={{ width: '100%' }}>
      <Row align="middle" gutter={24}>
        <Col>
          <GithubAvatar githubId={githubId} size={48} />
        </Col>
        <Col>
          {hasName && (
            <Row>
              <Typography.Link target="_blank" href={`/profile?githubId=${githubId}`} strong>
                {fullName}
              </Typography.Link>
            </Row>
          )}
          <Row>
            <Typography.Link target="_blank" href={`https://github.com/${githubId}`}>
              <GithubFilled /> {githubId}
            </Typography.Link>
          </Row>
        </Col>
      </Row>
      <Row>
        <Col span={24}>
          <Row>
            <Text type="secondary">Location</Text>
          </Row>
          <Row>
            <Text>{location}</Text>
          </Row>
        </Col>
      </Row>
      <Collapse defaultActiveKey={['courses']}>
        <Panel header="Contacts" key="contacts">
          <List
            itemLayout="horizontal"
            dataSource={UserContacts(student)}
            renderItem={item => (
              <List.Item>
                <List.Item.Meta avatar={<Avatar icon={item.icon} />} title={item.type} description={item.value} />
              </List.Item>
            )}
          />
        </Panel>
        <Panel header="Courses" key="courses">
          <List
            itemLayout="horizontal"
            dataSource={[...student.previousCourses, ...student.onGoingCourses].sort(course =>
              course.hasCertificate ? -1 : 1,
            )}
            renderItem={course => <CourseItem course={course} />}
          />
        </Panel>
      </Collapse>
    </Space>
  );
}
