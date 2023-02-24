import { Form, Select, Tag, Input, Checkbox, Button, Typography, Row, Col } from 'antd';
import { UpdateUserDtoLanguagesEnum } from 'api';
import { CourseIcon } from 'components/Icons';
import {
  DATA_PROCESSING_TEXT,
  ERROR_MESSAGES,
  LABELS,
  PLACEHOLDERS,
  VALIDATION_RULES,
} from 'modules/Registry/constants';
import { formatMonthFriendly } from 'services/formatter';
import { Course } from 'services/models';
import { FormCard } from 'modules/Registry/components';

type Props = {
  checkedList: number[];
  courses: Course[];
  onPrevious: () => void;
};

const { Title, Text } = Typography;

const formItemLayout = {
  labelCol: {
    sm: { span: 16, offset: 4 },
    md: { span: 7, offset: 0 },
  },
  wrapperCol: {
    sm: { span: 16, offset: 4 },
    md: { span: 10, offset: 0 },
  },
};

const tailFormItemLayout = {
  wrapperCol: {
    xs: { span: 12, offset: 0 },
    sm: { span: 16, offset: 4 },
    md: { span: 10, offset: 7 },
  },
};

const languages = Object.values(UpdateUserDtoLanguagesEnum).sort();

export function AdditionalInfo({ courses, checkedList, onPrevious }: Props) {
  return (
    <FormCard title={<Title level={5}>Additional information</Title>}>
      <Form.Item {...formItemLayout} name="preferedCourses" label={LABELS.courses} requiredMark="optional">
        <Select
          mode="multiple"
          value={checkedList}
          placeholder={PLACEHOLDERS.courses}
          options={courses.map(c => ({
            label: (
              <>
                <CourseIcon course={c} /> {`${c.name} (Start: ${formatMonthFriendly(c.startDate)})`}{' '}
                {c.planned ? <Tag color="orange">Planned</Tag> : <Tag color="green">In Progress</Tag>}
              </>
            ),
            value: c.id,
          }))}
        />
      </Form.Item>
      <Form.Item
        {...formItemLayout}
        name="languagesMentoring"
        label={LABELS.languages}
        rules={VALIDATION_RULES}
        required
      >
        <Select
          mode="multiple"
          placeholder={PLACEHOLDERS.languages}
          options={languages.map(language => ({
            label: language,
            value: language,
          }))}
        />
      </Form.Item>
      <Form.Item {...formItemLayout} name="aboutMyself" label={LABELS.aboutYourself}>
        <Input.TextArea rows={6} placeholder={PLACEHOLDERS.aboutYourself} />
      </Form.Item>
      <Form.Item
        {...tailFormItemLayout}
        name="dataProcessing"
        valuePropName="checked"
        rules={[
          {
            validator: (_, value) =>
              value ? Promise.resolve() : Promise.reject(new Error(ERROR_MESSAGES.shouldAgree)),
          },
        ]}
      >
        <Checkbox>
          <Text type="secondary">{DATA_PROCESSING_TEXT}</Text>
        </Checkbox>
      </Form.Item>
      <Form.Item {...tailFormItemLayout} className="buttons">
        <Row justify="end" gutter={16}>
          <Col>
            <Button size="large" type="default" onClick={onPrevious}>
              Previous
            </Button>
          </Col>
          <Col>
            <Button size="large" type="primary" htmlType="submit">
              Submit
            </Button>
          </Col>
        </Row>
      </Form.Item>
    </FormCard>
  );
}
