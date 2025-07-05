import { Table } from 'antd';
import type { TableProps } from 'antd';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import React from 'react';

interface RowProps extends React.HTMLAttributes<HTMLTableRowElement> {
  'data-row-key': string;
}

const DragSortTableRow = ({ children, ...props }: RowProps) => {
  const { attributes, setNodeRef, transform, transition, isDragging } = useSortable({ id: props['data-row-key'] });

  const style: React.CSSProperties = {
    ...props.style,
    transform: CSS.Transform.toString(transform),
    transition,
    ...(isDragging ? { position: 'relative', zIndex: 9999 } : {}),
  };

  return (
    <tr {...props} ref={setNodeRef} style={style} {...attributes}>
      {children}
    </tr>
  );
};

export const DragSortTable = <T extends object>(props: TableProps<T>) => {
  return (
    <Table
      {...props}
      components={{ ...props.components, body: { ...props.components?.body, row: DragSortTableRow } }}
    />
  );
};
