import { Row, Tabs } from 'antd';
import { BestWorkCard } from './BestWorkCard/BestWorkCard';
import React, { useEffect } from 'react';
import { IBestWork, ITask } from '../interfaces';

const { TabPane } = Tabs;

interface IBestWorkTabs {
  tasks: ITask[];
  selectTaskHandler: (id: number) => Promise<void>;
  works: IBestWork[];
  isAvailableAddButton: boolean;
  deleteCardHandler: (w: IBestWork) => void;
  editHandler: (work: IBestWork) => Promise<void>;
}

export function BestWorkTabs({
  tasks = [],
  selectTaskHandler,
  works,
  isAvailableAddButton,
  deleteCardHandler,
  editHandler,
}: IBestWorkTabs) {
  useEffect(() => {
    if (tasks.length > 0) selectTaskHandler(tasks[0].taskId);
  }, [tasks]);

  return (
    <Tabs defaultActiveKey="1" style={{ paddingLeft: '20px' }} onChange={e => selectTaskHandler(Number(e))}>
      {tasks.map(t => {
        return (
          <TabPane tab={t.taskName} key={t.taskId}>
            <Row gutter={24}>
              <BestWorkCard
                works={works}
                isManageAccess={isAvailableAddButton}
                deleteCardHandler={deleteCardHandler}
                editHandler={editHandler}
              />
            </Row>
          </TabPane>
        );
      })}
    </Tabs>
  );
}
