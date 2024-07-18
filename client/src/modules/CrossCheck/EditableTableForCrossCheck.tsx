import { Form, Table } from 'antd';
import React, { useState } from 'react';
import { EditableCellForCrossCheck } from './EditableCellForCrossCheck';
import { CriteriaDto } from 'api';
import { CriteriaActions } from './CriteriaActions';

interface IEditableTableProps {
  dataCriteria: CriteriaDto[];
  setDataCriteria: (data: CriteriaDto[]) => void;
}

export const EditableTable = ({ dataCriteria, setDataCriteria }: IEditableTableProps) => {
  const [form] = Form.useForm();
  const [editingKey, setEditingKey] = useState('');

  const isEditing = (record: CriteriaDto) => record.key === editingKey;

  const edit = (record: Partial<CriteriaDto> & { key: React.Key }) => {
    form.setFieldsValue({ type: '', text: '', ...record });
    setEditingKey(record.key);
  };

  const remove = (key: React.Key) => {
    setDataCriteria(dataCriteria.filter(item => item.key !== key));
  };

  const save = async (key: React.Key) => {
    const row = (await form.validateFields()) as CriteriaDto;

    const newData = [...dataCriteria];
    const index = newData.findIndex(item => key === item.key);

    if (index > -1) {
      const item = newData[index];
      newData.splice(index, 1, {
        ...item,
        ...row,
      });
      setDataCriteria(newData);
      setEditingKey('');
    } else {
      newData.push(row);
      setDataCriteria(newData);
      setEditingKey('');
    }
  };

  const cancel = () => {
    setEditingKey('');
  };

  const columns = [
    {
      title: 'Sort',
      dataIndex: 'sort',
      width: '7%',
      className: 'drag-visible',
    },
    {
      title: 'Type',
      dataIndex: 'type',
      width: '12.5%',
      editable: true,
    },
    {
      title: 'Max',
      dataIndex: 'max',
      width: '9%',
      editable: true,
    },
    {
      title: 'Text',
      dataIndex: 'text',
      width: '55%',
      editable: true,
    },
    {
      title: 'Actions',
      dataIndex: 'actions',
      width: '16.5%',
      render: (_: any, record: CriteriaDto) => (
        <CriteriaActions
          editable={isEditing(record)}
          record={record}
          editingKey={editingKey}
          cancel={cancel}
          edit={edit}
          remove={remove}
          save={save}
        />
      ),
    },
  ];

  const mergedColumns = columns.map(col => {
    if (!col.editable) {
      return col;
    }

    return {
      ...col,
      onCell: (record: CriteriaDto) => ({
        record,
        inputType: col.dataIndex === 'max' ? 'max' : col.dataIndex === 'type' ? 'text' : 'description',
        dataIndex: col.dataIndex,
        title: col.title,
        editing: isEditing(record),
        type: record.type,
        points: record.max,
      }),
    };
  });

  return (
    <Form form={form} component={false}>
      <Table
        rowKey="index"
        components={{
          body: {
            cell: EditableCellForCrossCheck,
          },
        }}
        style={{ wordBreak: 'break-word', fontStyle: 'normal' }}
        size="small"
        dataSource={dataCriteria}
        columns={mergedColumns}
        rowClassName="editable-row"
        pagination={false}
      />
    </Form>
  );
};
