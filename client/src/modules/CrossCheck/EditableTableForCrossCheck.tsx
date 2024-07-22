import { Form, Table } from 'antd';
import React, { useState } from 'react';
import { EditableCellForCrossCheck } from './EditableCellForCrossCheck';
import { CriteriaDto, CriteriaDtoTypeEnum } from 'api';
import { CriteriaActions } from './CriteriaActions';
import { EditableTableColumnsDataIndex } from './constants';

interface IEditableTableProps {
  dataCriteria: CriteriaDto[];
  setDataCriteria: (data: CriteriaDto[]) => void;
}

export const EditableTable = ({ dataCriteria, setDataCriteria }: IEditableTableProps) => {
  const [form] = Form.useForm();
  const [editingKey, setEditingKey] = useState('');
  const [originData, setOriginData] = useState<CriteriaDto[]>([]);

  const isEditing = (record: CriteriaDto) => record.key === editingKey;

  const edit = (record: Partial<CriteriaDto> & { key: React.Key }) => {
    setOriginData(dataCriteria);
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
    setDataCriteria(originData);
    setEditingKey('');
  };

  const changeTaskType = async (value: string) => {
    const row = (await form.validateFields()) as CriteriaDto;

    const newData = [...dataCriteria];
    const index = newData.findIndex(item => editingKey === item.key);

    if (index > -1) {
      const item = newData[index];
      newData.splice(index, 1, {
        ...item,
        type: value as CriteriaDtoTypeEnum,
        max: value === CriteriaDtoTypeEnum.Title ? undefined : item.max,
      });
      setDataCriteria(newData);
    } else {
      newData.push(row);
      setDataCriteria(newData);
    }
  };

  const columns = [
    {
      title: 'Type',
      dataIndex: EditableTableColumnsDataIndex.Type,
      width: '18%',
      editable: true,
    },
    {
      title: 'Max',
      dataIndex: EditableTableColumnsDataIndex.Max,
      width: '10%',
      editable: true,
    },
    {
      title: 'Text',
      dataIndex: EditableTableColumnsDataIndex.Text,
      width: '52%',
      editable: true,
    },
    {
      title: 'Actions',
      dataIndex: EditableTableColumnsDataIndex.Actions,
      width: '20%',
      render: (_: any, record: CriteriaDto) => (
        <CriteriaActions
          editing={isEditing(record)}
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
        dataIndex: col.dataIndex,
        title: col.title,
        editing: isEditing(record),
        onSelectChange: changeTaskType,
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
