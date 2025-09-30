import { FileExcelOutlined } from '@ant-design/icons';
import { Button, Tooltip } from 'antd';

type Props = {
  enabled?: boolean;
  onClick: () => void;
};

export function ExportCsvButton(props: Props) {
  if (!props.enabled) {
    return null;
  }
  return (
    <Tooltip title="Export to CSV" placement="left">
      <Button shape="circle" type="link" onClick={props.onClick}>
        <FileExcelOutlined onClick={props.onClick} style={{ fontSize: '2.5ch', display: 'block' }} />
      </Button>
    </Tooltip>
  );
}
