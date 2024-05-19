import DeleteOutlined from '@ant-design/icons/DeleteOutlined';
import { Button, Popconfirm } from 'antd';

export function DeleteAllCrossCheckCriteriaButton() {
  return (
    <div style={{ textAlign: 'right' }}>
      <Popconfirm title="Are you sure you want to delete all items?">
        <Button icon={<DeleteOutlined style={{ marginRight: 5 }} />} style={{ marginTop: 15 }} danger>
          Delete all
        </Button>
      </Popconfirm>
    </div>
  );
}
