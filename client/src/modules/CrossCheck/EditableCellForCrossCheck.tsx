import { CriteriaDto } from '@client/api';
import React from 'react';
import { EditableCriteriaInput } from './EditableCriteriaInput';
import { EditableTableColumnsDataIndex } from './constants';
import { theme } from 'antd';

interface EditableCellProps extends React.HTMLAttributes<HTMLElement> {
  editing: boolean;
  dataIndex: EditableTableColumnsDataIndex;
  record: CriteriaDto;
  index: number;
  children: React.ReactNode;
  onSelectChange: (value: string) => void;
}

export const EditableCellForCrossCheck: React.FC<EditableCellProps> = ({
  editing,
  dataIndex,
  children,
  record,
  onSelectChange,
  ...props
}) => {
  const hasMax = record?.max !== 0;
  const { token } = theme.useToken();

  return (
    <td
      {...props}
      title={hasMax ? '' : 'Check points for this line'}
      style={{ color: hasMax ? token.colorTextBase : token.colorWarning }}
    >
      {editing ? (
        <EditableCriteriaInput dataIndex={dataIndex} onSelectChange={onSelectChange} type={record?.type} />
      ) : (
        children
      )}
    </td>
  );
};
