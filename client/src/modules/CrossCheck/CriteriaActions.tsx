import { FC } from 'react';
import { CriteriaDto } from '../../api';
import { Popconfirm, Typography, Space } from 'antd';

interface CriteriaActionsProps {
  editing: boolean;
  record: CriteriaDto;
  editingKey: string;
  save: (key: string) => void;
  remove: (key: string) => void;
  cancel: () => void;
  edit: (record: CriteriaDto) => void;
}

export const CriteriaActions: FC<CriteriaActionsProps> = ({
  editing,
  cancel,
  remove,
  edit,
  save,
  record,
  editingKey,
}) =>
  editing ? (
    <Space direction="horizontal">
      <Typography.Link onClick={() => save(record.key)}>Save</Typography.Link>
      <Typography.Link type="secondary" onClick={cancel}>
        Cancel
      </Typography.Link>
    </Space>
  ) : (
    <Space direction="horizontal">
      <Typography.Link disabled={!!editingKey} onClick={() => edit(record)}>
        Edit
      </Typography.Link>
      <Popconfirm
        title="Are you sure to delete this criteria?"
        okText="Delete"
        okButtonProps={{
          danger: true,
        }}
        onConfirm={() => remove(record.key)}
      >
        <Typography.Link type="danger">Delete</Typography.Link>
      </Popconfirm>
    </Space>
  );
