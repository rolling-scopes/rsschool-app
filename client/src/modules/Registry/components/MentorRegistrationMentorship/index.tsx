import { Checkbox, Col, Form, Input, Row, Select, Typography } from 'antd';
import { DEFAULT_COLUMN_SIZES, DEFAULT_ROW_GUTTER, TECHNOLOGIES } from 'modules/Registry/constants';

type Props = {
  checkedList: number[];
};

export function MentorRegistrationMentorship({ checkedList }: Props) {
  return (
    <>
      <Row>
        <Typography.Title style={{ marginBottom: 32 }} level={3}>
          Mentorship
        </Typography.Title>
      </Row>

      <Row gutter={DEFAULT_ROW_GUTTER}>
        <Col {...DEFAULT_COLUMN_SIZES}>
          <Row>
            <Typography.Title level={5}>Pick technology which you can mentor</Typography.Title>
          </Row>
          <Form.Item name="technicalMentoring">
            <Checkbox.Group
              className="technology"
              value={checkedList}
              options={TECHNOLOGIES.map(technology => ({
                label: <Row style={{ minWidth: 240 }}>{`${technology.displayName}`}</Row>,
                value: technology.id,
              }))}
            />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={DEFAULT_ROW_GUTTER}>
        <Col {...DEFAULT_COLUMN_SIZES}>
          <Row>
            <Typography.Title level={5}>How many students are you ready to mentor per course?</Typography.Title>
          </Row>
          <Form.Item name="maxStudentsLimit" rules={[{ required: true, message: 'Please select students count' }]}>
            <Select placeholder="Select students count...">
              <Select.Option value={2}>2</Select.Option>
              <Select.Option value={3}>3</Select.Option>
              <Select.Option value={4}>4</Select.Option>
              <Select.Option value={5}>5</Select.Option>
              <Select.Option value={6}>6</Select.Option>
            </Select>
          </Form.Item>
        </Col>
      </Row>
      <Row gutter={DEFAULT_ROW_GUTTER}>
        <Col {...DEFAULT_COLUMN_SIZES}>
          <Row>
            <Typography.Title level={5}>Preferred students location</Typography.Title>
          </Row>
          <Form.Item
            name="preferedStudentsLocation"
            rules={[{ required: true, message: 'Please select a preferred location option' }]}
          >
            <Select placeholder="Select a preferred option...">
              <Select.Option value={'any'}>Any city or country</Select.Option>
              <Select.Option value={'country'}>My country only</Select.Option>
              <Select.Option value={'city'}>My city only</Select.Option>
            </Select>
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={DEFAULT_ROW_GUTTER}>
        <Col {...DEFAULT_COLUMN_SIZES}>
          <Row>
            <Typography.Title level={5}>Which language are you able to mentor?</Typography.Title>
          </Row>
          <Form.Item name="languagesMentoring">
            <Select mode="multiple" placeholder="Select languages...">
              <Select.Option value={'english'}>English</Select.Option>
              <Select.Option value={'russian'}>Russian</Select.Option>
            </Select>
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={DEFAULT_ROW_GUTTER}>
        <Col {...DEFAULT_COLUMN_SIZES}>
          <Row>
            <Typography.Title level={5}>About Yourself</Typography.Title>
          </Row>
          <Form.Item name="aboutMyself">
            <Input.TextArea rows={6} placeholder="A couple words about yourself..." />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={DEFAULT_ROW_GUTTER}>
        <Col {...DEFAULT_COLUMN_SIZES} style={{ marginBottom: 40 }}>
          <span>
            By clicking on the button, I agree to the processing of my personal data contained in the application and
            sharing it with companies only for students employment purposes.
          </span>
        </Col>
      </Row>
    </>
  );
}
