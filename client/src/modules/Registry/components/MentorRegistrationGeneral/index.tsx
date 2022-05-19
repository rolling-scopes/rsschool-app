import { Col, Form, Input, Row, Select, Typography, Tag, Alert } from 'antd';
import { Dispatch, SetStateAction } from 'react';

import {
  TEXT_EPAM_EMAIL_TOOLTIP,
  TEXT_EMAIL_TOOLTIP,
  DEFAULT_COLUMN_SIZES,
  DEFAULT_DOUBLE_COLUMN_SIZES,
  DEFAULT_ROW_GUTTER,
  TEXT_LOCATION_MENTOR_TOOLTIP,
  RSSCHOOL_BOT_LINK,
} from 'modules/Registry/constants';
import { LocationSelect } from 'components/Forms';
import { formatMonthFriendly } from 'services/formatter';
import { emailPattern, englishNamePattern, epamEmailPattern } from 'services/validators';
import { Location } from 'common/models';
import type { Course } from 'services/models';
import { Info } from 'modules/Registry/components/Info';
import { FormData } from '../../pages/Mentor/formData';

type Props = {
  courses: Course[];
  checkedList: number[];
  location: Location | null;
  data: FormData;
  setLocation: Dispatch<SetStateAction<Location | null>>;
};

export function MentorRegistrationGeneral({ courses, checkedList, location, setLocation }: Props) {
  return (
    <>
      <Row>
        <Typography.Title style={{ marginBottom: 32 }} level={3}>
          General
        </Typography.Title>
      </Row>

      <Row gutter={DEFAULT_ROW_GUTTER}>
        <Col {...DEFAULT_COLUMN_SIZES}>
          <Row>
            <Typography.Title level={5}>Preferred Courses</Typography.Title>
          </Row>
          <Form.Item name="preferedCourses">
            <Select
              mode="multiple"
              value={checkedList}
              options={courses.map(c => ({
                label: (
                  <>
                    {`${c.name} (Start: ${formatMonthFriendly(c.startDate)})`}{' '}
                    {c.planned ? <Tag color="orange">Planned</Tag> : <Tag color="green">In Progress</Tag>}
                  </>
                ),
                value: c.id,
              }))}
            />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={DEFAULT_ROW_GUTTER}>
        <Col {...DEFAULT_DOUBLE_COLUMN_SIZES} style={{ marginBottom: 24 }}>
          <Row>
            <Typography.Title level={5}>First Name</Typography.Title>
          </Row>
          <Row>
            <Col {...DEFAULT_COLUMN_SIZES}>
              <Form.Item
                name="firstName"
                style={{ marginBottom: '0' }}
                rules={[{ required: true, pattern: englishNamePattern, message: 'First name should be in English' }]}
              >
                <Input placeholder="Dzmitry" />
              </Form.Item>
            </Col>
          </Row>
          <span className="descriptions-name">In English, as in passport</span>
        </Col>
        <Col {...DEFAULT_DOUBLE_COLUMN_SIZES} style={{ marginBottom: 24 }}>
          <Row>
            <Typography.Title level={5}>Last Name</Typography.Title>
          </Row>
          <Row>
            <Col {...DEFAULT_COLUMN_SIZES}>
              <Form.Item
                name="lastName"
                style={{ marginBottom: '0' }}
                rules={[{ required: true, pattern: englishNamePattern, message: 'Last name should be in English' }]}
              >
                <Input placeholder="Varabei" />
              </Form.Item>
            </Col>
          </Row>
          <span className="descriptions-name last">In English, as in passport</span>
        </Col>
      </Row>
      <Row gutter={DEFAULT_ROW_GUTTER}>
        <Col {...DEFAULT_COLUMN_SIZES}>
          <Row>
            <Typography.Title level={5}>
              Location <Info title={TEXT_LOCATION_MENTOR_TOOLTIP} />
            </Typography.Title>
          </Row>
          <Row>
            <Col {...DEFAULT_COLUMN_SIZES}>
              <Form.Item
                name="location"
                rules={[{ required: true, message: 'Please select city' }]}
                valuePropName={'location'}
              >
                <LocationSelect onChange={setLocation} location={location} />
              </Form.Item>
            </Col>
          </Row>
        </Col>
      </Row>
      <Row gutter={DEFAULT_ROW_GUTTER}>
        <Col {...DEFAULT_COLUMN_SIZES}>
          <Row>
            <Typography.Title level={5}>
              E-mail <Info title={TEXT_EMAIL_TOOLTIP} />
            </Typography.Title>
          </Row>
          <Row>
            <Col {...DEFAULT_COLUMN_SIZES}>
              <Form.Item
                name="primaryEmail"
                rules={[{ required: true, pattern: emailPattern, message: 'Email is required' }]}
              >
                <Input placeholder="user@example.com" />
              </Form.Item>
            </Col>
          </Row>
        </Col>
      </Row>
      <Row gutter={DEFAULT_ROW_GUTTER}>
        <Col {...DEFAULT_COLUMN_SIZES}>
          <Row>
            <Typography.Title level={5}>
              EPAM E-mail <Info title={TEXT_EPAM_EMAIL_TOOLTIP} />
            </Typography.Title>
          </Row>
          <Row>
            <Col {...DEFAULT_COLUMN_SIZES}>
              <Form.Item
                name="contactsEpamEmail"
                rules={[{ message: 'Please enter a valid EPAM email', pattern: epamEmailPattern }]}
              >
                <Input placeholder="first_last@epam.com" />
              </Form.Item>
            </Col>
          </Row>
        </Col>
      </Row>
      <Row gutter={DEFAULT_ROW_GUTTER}>
        <Col {...DEFAULT_DOUBLE_COLUMN_SIZES} style={{ marginBottom: 24 }}>
          <Row>
            <Typography.Title level={5}>Telegram</Typography.Title>
          </Row>
          <Row>
            <Col {...DEFAULT_COLUMN_SIZES}>
              <Form.Item name="contactsTelegram" style={{ marginBottom: '0' }}>
                <Input addonBefore="@" placeholder="durov" />
              </Form.Item>
              <Typography.Paragraph style={{ margin: '12px 0 0 0' }}>
                <Alert
                  type="info"
                  message={
                    <span>
                      Subscribe to our{' '}
                      <a href={RSSCHOOL_BOT_LINK} target="_blank">
                        Telegram-bot
                      </a>{' '}
                      to keep in touch with us.
                    </span>
                  }
                />
              </Typography.Paragraph>
            </Col>
          </Row>
        </Col>
        <Col {...DEFAULT_DOUBLE_COLUMN_SIZES} style={{ marginBottom: 24 }}>
          <Row>
            <Typography.Title level={5}>Skype</Typography.Title>
          </Row>
          <Row>
            <Col {...DEFAULT_COLUMN_SIZES}>
              <Form.Item name="contactsSkype" style={{ marginBottom: '0' }}>
                <Input placeholder="johnsmith" />
              </Form.Item>
            </Col>
          </Row>
        </Col>
      </Row>
      <Row gutter={DEFAULT_ROW_GUTTER}>
        <Col {...DEFAULT_COLUMN_SIZES}>
          <Row>
            <Typography.Title level={5}>Contact Notes</Typography.Title>
          </Row>
          <Row>
            <Col {...DEFAULT_COLUMN_SIZES}>
              <Form.Item name="contactsNotes">
                <Input.TextArea rows={4} placeholder="Preferable time to contact, planned day offs etc." />
              </Form.Item>
            </Col>
          </Row>
        </Col>
      </Row>
    </>
  );
}
