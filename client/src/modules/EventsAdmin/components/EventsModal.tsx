import { Form, Input, Select } from 'antd';
import { ModalForm } from '@client/shared/components/Forms';
import { EventDto, DisciplineDto } from '@client/api';
import { EVENT_TYPES } from 'data/eventTypes';

type Props = {
  data: Partial<EventDto> | null;
  title: string;
  submit: (values: any) => Promise<void>;
  cancel: () => void;
  getInitialValues: (data: Partial<EventDto>) => any;
  disciplines: DisciplineDto[];
};

export function EventsModal({ data, title, submit, cancel, getInitialValues, disciplines }: Props) {
  return data ? (
    <ModalForm data={data} title={title} submit={submit} cancel={cancel} getInitialValues={getInitialValues}>
      <Form.Item name="name" label="Name" rules={[{ required: true, message: 'Please enter event name' }]}>
        <Input />
      </Form.Item>
      <Form.Item name="type" label="Event Type" rules={[{ required: true, message: 'Please select a type' }]}>
        <Select>
          {EVENT_TYPES.map(({ name, id }) => (
            <Select.Option key={id} value={id}>
              {name}
            </Select.Option>
          ))}
        </Select>
      </Form.Item>
      <Form.Item
        required
        name="disciplineId"
        label="Discipline"
        rules={[{ required: true, message: 'Please select a discipline' }]}
      >
        <Select>
          {disciplines.map(({ id, name }) => (
            <Select.Option key={id} value={id}>
              {name}
            </Select.Option>
          ))}
        </Select>
      </Form.Item>
      <Form.Item name="descriptionUrl" label="Description URL">
        <Input />
      </Form.Item>
      <Form.Item name="description" label="Description">
        <Input.TextArea />
      </Form.Item>
    </ModalForm>
  ) : null;
}
