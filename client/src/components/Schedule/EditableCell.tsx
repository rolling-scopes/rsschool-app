import React from 'react';
import { Form, Input, InputNumber, DatePicker, TimePicker, Select } from 'antd';
import { Rule } from 'antd/lib/form';
import { UserSearch } from 'components/UserSearch';
import { CourseEvent } from 'services/course';
import { EVENT_TYPES, SPECIAL_ENTITY_TAGS, TASK_TYPES } from './model';
import { UserService } from 'services/user';

const { Option } = Select;
interface EditableCellProps extends React.HTMLAttributes<HTMLElement> {
  editing: boolean;
  dataIndex: string;
  title: any;
  inputType: 'number' | 'text';
  record: CourseEvent;
  index: number;
  children: React.ReactNode;
}

const EditableCell: React.FC<EditableCellProps> = ({
  editing,
  dataIndex,
  title,
  record,
  index,
  children,
  ...restProps
}) => {
  let inputNode;
  let rules: Rule = { type: 'string', required: false };

  const types =
    record && record.isTask
      ? TASK_TYPES.map(tag => {
          return (
            <Option key={tag} value={tag}>
              {tag}
            </Option>
          );
        })
      : EVENT_TYPES.map(tag => {
          return (
            <Option key={tag} value={tag}>
              {tag}
            </Option>
          );
        });

  switch (title) {
    case 'Date':
      inputNode = <DatePicker style={{ minWidth: 120 }} />;
      rules = { type: 'object', required: true };
      break;
    case 'Time':
      inputNode = <TimePicker style={{ minWidth: 80 }} format={'HH:mm'} minuteStep={5} />;
      rules = { type: 'object', required: true };
      break;
    case 'Type':
      inputNode = <Select style={{ minWidth: 120 }}>{types}</Select>;
      break;
    case 'Special':
      inputNode = (
        <Select mode="tags" style={{ minWidth: 100 }} tokenSeparators={[',']} allowClear>
          {SPECIAL_ENTITY_TAGS.map((tag: string) => (
            <Option key={tag} value={tag}>
              {tag}
            </Option>
          ))}
        </Select>
      );
      rules = { required: false };
      break;
    case 'Duration':
      inputNode = <InputNumber style={{ width: 60 }} min={0} />;
      rules = { type: 'number', required: false };
      break;
    case 'Organizer':
      inputNode = <UserSearch style={{ minWidth: 150 }} searchFn={loadUsers} />;
      rules = { required: false, message: 'Please select a organizer' };
      break;
    case 'Place':
      inputNode = <Input style={{ minWidth: 150 }} disabled={record.isTask} />;
      rules = { type: 'string', required: false };
      break;
    default:
      inputNode = <Input style={{ minWidth: 150 }} />;
      rules = { type: 'string', required: false };
      break;
  }

  return (
    <td {...restProps}>
      {editing ? (
        <Form.Item name={dataIndex} rules={[rules]} style={{ margin: 0 }}>
          {inputNode}
        </Form.Item>
      ) : (
        children
      )}
    </td>
  );
};

const loadUsers = async (searchText: string) => {
  return new UserService().searchUser(searchText);
};

export default EditableCell;
