import { Layout, Menu } from 'antd';
import React, { useEffect, useMemo, useState } from 'react';
import { BestWorkService } from '../../../services/bestWork/bestWork';
import { StarOutlined } from '@ant-design/icons';
import { ICourse } from '../interfaces';

const { Sider } = Layout;

interface ISelectBestWorkProps {
  getCourseTaskList: (id: number) => Promise<void>;
}

export function BestWorkMenu({ getCourseTaskList }: ISelectBestWorkProps) {
  const [courses, setCourses] = useState<ICourse[]>([]);

  const bestWorkService = useMemo(() => new BestWorkService(), []);

  async function getCourses() {
    const coursesList = await bestWorkService.getCourseList();
    setCourses(coursesList);
  }

  useEffect(() => {
    getCourses();
  }, []);

  return (
    <Sider style={{ backgroundColor: 'white' }}>
      <Menu onClick={e => getCourseTaskList(Number(e.key))}>
        {courses.map(c => {
          return (
            <Menu.Item key={c.courseId} icon={<StarOutlined />}>
              {c.courseName}
            </Menu.Item>
          );
        })}
      </Menu>
    </Sider>
  );
}
