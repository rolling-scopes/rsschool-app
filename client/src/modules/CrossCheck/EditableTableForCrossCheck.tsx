import { Form, Table, Typography, Popconfirm } from 'antd';
import React, { useState } from 'react';
import { SaveOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { CriteriaData } from 'services/course';
import { EditableCellForCrossCheck } from './EditableCellForCrossCheck';
import { MenuOutlined } from '@ant-design/icons';
import { arrayMoveImmutable } from './utils/arrayMoveImmutable';
import { SortableElement, SortableHandle, SortableContainer } from 'react-sortable-hoc';

interface IEditableTableProps {
  dataCriteria: CriteriaData[];
  setDataCriteria: (data: CriteriaData[]) => void;
}
interface CriteriaIndex {
  oldIndex: number;
  newIndex: number;
}

const DragHandle = SortableHandle(() => <MenuOutlined style={{ cursor: 'grab', color: '#999' }} />);

const SortableItem = SortableElement((props: Record<string, unknown>) => {
  return <tr {...props} />;
});
const SortableBody = SortableContainer((props: Record<string, unknown>) => {
  return <tbody {...props} />;
});

export const EditableTable = ({ dataCriteria, setDataCriteria }: IEditableTableProps) => {
  const [form] = Form.useForm();
  const [editingKey, setEditingKey] = useState('');

  const onSortEnd = ({ oldIndex, newIndex }: CriteriaIndex) => {
    if (oldIndex !== newIndex) {
      const newData = arrayMoveImmutable(dataCriteria, oldIndex, newIndex).filter(el => !!el);
      setDataCriteria(newData);
    }
  };

  const DraggableContainer = (props: Record<string, unknown>) => {
    return <SortableBody useDragHandle disableAutoscroll helperClass="row-dragging" onSortEnd={onSortEnd} {...props} />;
  };

  const DraggableBodyRow = ({ ...restProps }) => {
    const index = dataCriteria.findIndex(x => x.index === restProps['data-row-key']);
    return <SortableItem index={index} {...restProps} />;
  };

  const isEditing = (record: CriteriaData) => record.key === editingKey;

  const edit = (record: Partial<CriteriaData> & { key: React.Key }) => {
    form.setFieldsValue({ type: '', text: '', ...record });
    setEditingKey(record.key);
  };

  const handleDelete = (key: React.Key) => {
    const newData = [...dataCriteria];
    setDataCriteria(newData.filter(item => item.key !== key));
  };

  const save = async (key: React.Key) => {
    const row = (await form.validateFields()) as CriteriaData;

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

  const columns = [
    {
      title: 'Sort',
      dataIndex: 'sort',
      width: '7%',
      className: 'drag-visible',
      render: () => <DragHandle />,
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
      title: 'Action',
      dataIndex: 'action',
      width: '10%',
      render: (_: any, record: CriteriaData) => {
        const editable = isEditing(record);
        return editable ? (
          <span>
            <Typography.Link onClick={() => save(record.key)} style={{ marginLeft: 8 }}>
              <SaveOutlined />
            </Typography.Link>
          </span>
        ) : (
          <span>
            <Typography.Link disabled={editingKey !== ''} onClick={() => edit(record)} style={{ marginRight: 5 }}>
              <EditOutlined />
            </Typography.Link>
            <Popconfirm title="Sure to delete?" onConfirm={() => handleDelete(record.key)}>
              <Typography.Link>
                <DeleteOutlined />
              </Typography.Link>
            </Popconfirm>
          </span>
        );
      },
    },
  ];

  const mergedColumns = columns.map(col => {
    if (!col.editable) {
      return col;
    }
    return {
      ...col,
      onCell: (record: CriteriaData) => ({
        record,
        inputType: col.dataIndex === 'max' ? 'max' : col.dataIndex === 'type' ? 'text' : 'description',
        dataIndex: col.dataIndex,
        title: col.title,
        editing: isEditing(record),
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
            wrapper: DraggableContainer,
            row: DraggableBodyRow,
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
