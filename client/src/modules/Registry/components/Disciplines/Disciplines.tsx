import { Form, Checkbox, Row, Empty, Typography, Col } from 'antd';
import { DisciplineDto } from 'api';
import { LABELS, VALIDATION_RULES } from 'modules/Registry/constants';
import { FormCard } from 'modules/Registry/components';

type Props = {
  disciplines: DisciplineDto[];
};

const { Title } = Typography;

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

export function Disciplines({ disciplines }: Props) {
  return (
    <FormCard title={<Title level={5}>Disciplines</Title>}>
      {disciplines.length ? (
        <Form.Item
          {...formItemLayout}
          name="technicalMentoring"
          label={LABELS.disciplines}
          rules={VALIDATION_RULES}
          required
        >
          <Checkbox.Group
            style={{
              paddingTop: '5px',
            }}
          >
            <Row justify="space-between" gutter={[0, 8]}>
              {disciplines.map(({ name }) => (
                <Col span={12} key={name}>
                  <Checkbox value={name}>{name}</Checkbox>
                </Col>
              ))}
            </Row>
          </Checkbox.Group>
        </Form.Item>
      ) : (
        <Empty />
      )}
    </FormCard>
  );
}
