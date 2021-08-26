import { Col, Row, Select } from 'antd';
import React, { useEffect, useMemo, useState } from 'react';
import { BestWorkService, ICourse, ITask } from '../../services/bestWork';

const { Option } = Select;

interface ISelectBestWorkProps {
  taskSelectOnChange: (id: number) => Promise<void>;
}

export function SelectBestWork({ taskSelectOnChange }: ISelectBestWorkProps) {
  const [isTaskSelectDisabled, setIsTaskSelectDisabled] = useState(true);
  const [courses, setCourses] = useState<ICourse[]>([]);
  const [tasks, setTasks] = useState<ITask[]>([]);
  const bestWorkService = useMemo(() => new BestWorkService(), []);

  async function getCourses() {
    const coursesList = await bestWorkService.getCourseList();
    setCourses(coursesList);
  }

  async function getCourseTaskList(id: number) {
    const taskList = await bestWorkService.getTaskList(id);
    setTasks(taskList);
    setIsTaskSelectDisabled(false);
  }

  useEffect(() => {
    getCourses();
  }, []);

  return (
    <Row gutter={24}>
      <Col>
        <Select placeholder="Please select course" onChange={getCourseTaskList}>
          {courses.map(e => (
            <Option value={e.courseId} key={e.courseId}>
              {e.courseName}
            </Option>
          ))}
        </Select>
      </Col>
      <Col>
        <Select placeholder="Please select task" disabled={isTaskSelectDisabled} onChange={taskSelectOnChange}>
          {tasks.map(e => (
            <Option value={e.taskId} key={e.taskId}>
              {e.taskName}
            </Option>
          ))}
        </Select>
      </Col>
    </Row>
  );
}
