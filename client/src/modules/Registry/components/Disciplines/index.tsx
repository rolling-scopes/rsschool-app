import { Form, Checkbox, Row, Empty, Typography } from 'antd';
import { DisciplineDto } from 'api';
import { LABELS, VALIDATION_RULES } from 'modules/Registry/constants';
import { FormCard } from '../FormCard';

type Props = {
  disciplines: DisciplineDto[];
};

const { Title } = Typography;

export function Disciplines({ disciplines }: Props) {
  return (
    <FormCard title={<Title level={5}>Disciplines</Title>}>
      {disciplines.length ? (
        <Form.Item
          name="technicalMentoring"
          label={LABELS.disciplines}
          labelAlign="right"
          rules={VALIDATION_RULES}
          required
        >
          <Checkbox.Group
            style={{
              paddingTop: '5px',
              maxWidth: '360px',
            }}
            options={disciplines.map(discipline => ({
              label: (
                <Row
                  style={{
                    minWidth: '140px',
                    maxWidth: '150px',
                  }}
                >{`${discipline.name}`}</Row>
              ),
              value: discipline.name,
            }))}
          />
        </Form.Item>
      ) : (
        <Empty />
      )}
    </FormCard>
  );
}
