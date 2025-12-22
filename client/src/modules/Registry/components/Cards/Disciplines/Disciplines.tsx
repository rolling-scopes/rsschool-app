import { Form, Checkbox, Row, Empty, Typography, Col } from 'antd';
import { DisciplineDto } from '@client/api';
import { CARD_TITLES, LABELS, VALIDATION_RULES, WIDE_FORM_ITEM_LAYOUT } from 'modules/Registry/constants';
import { FormCard } from 'modules/Registry/components';

type Props = {
  disciplines: DisciplineDto[];
};

const { Title } = Typography;

const formItemLayout = WIDE_FORM_ITEM_LAYOUT();

export function Disciplines({ disciplines }: Props) {
  return (
    <FormCard
      title={
        <Title level={5} style={{ marginBottom: 0 }}>
          {CARD_TITLES.disciplines}
        </Title>
      }
    >
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
