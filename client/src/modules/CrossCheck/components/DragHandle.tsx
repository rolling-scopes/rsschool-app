import { useSortable } from '@dnd-kit/sortable';
import { MenuOutlined } from '@ant-design/icons';

import { Button } from 'antd';
import styles from './DragHandle.module.css';

export const DragHandle = ({ id }: { id: string }) => {
  const { attributes, listeners, setActivatorNodeRef } = useSortable({ id });

  return (
    <span ref={setActivatorNodeRef} {...attributes} {...listeners}>
      <Button className={styles.dragHandle} type="text" icon={<MenuOutlined />} />
    </span>
  );
};
