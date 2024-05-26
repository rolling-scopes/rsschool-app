import DeleteOutlined from '@ant-design/icons/DeleteOutlined';
import { Button, Popconfirm } from 'antd';
import { CriteriaDto } from 'api';

interface Props {
  setDataCriteria: (criteria: CriteriaDto[]) => void;
}
export function DeleteAllCrossCheckCriteriaButton({ setDataCriteria }: Props) {
  const deleteAllCrossCheckCriteria = () => {
    setDataCriteria([])
  };
  return (
    <div style={{ textAlign: 'right' }}>
      <Popconfirm title="Are you sure you want to delete all items?" onConfirm={deleteAllCrossCheckCriteria}>
        <Button icon={<DeleteOutlined style={{ marginRight: 5 }} />} style={{ marginTop: 15 }} danger>
          Delete all
        </Button>
      </Popconfirm>
    </div>
  );
}
