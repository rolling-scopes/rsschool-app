import { FileExcelOutlined } from '@ant-design/icons';
import { Button } from 'antd';

type Props = {
  enabled?: boolean;
  onClick: () => void;
};

export function ExportCsvButton(props: Props) {
  if (!props.enabled) {
    return null;
  }
  return (
    <Button icon={<FileExcelOutlined />} onClick={props.onClick}>
      Export CSV
    </Button>
  );
}
