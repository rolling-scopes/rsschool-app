import { useSortable } from '@dnd-kit/sortable';
import { MenuOutlined } from '@ant-design/icons';

import css from 'styled-jsx/css';
import { Button } from 'antd';

export const DragHandle = ({ id }: { id: string }) => {
  const { attributes, listeners, setActivatorNodeRef } = useSortable({ id });

  return (
    <>
      <span ref={setActivatorNodeRef} {...attributes} {...listeners}>
        <Button className={`drag-handle ${dragDrop}`} type="text" icon={<MenuOutlined />} />
      </span>
      {buttonStyles}
    </>
  );
};

const { className: dragDrop, styles: buttonStyles } = css.resolve`
  .drag-handle {
    cursor: grab;
  }
  .drag-handle:active {
    cursor: grabbing;
  }
`;
