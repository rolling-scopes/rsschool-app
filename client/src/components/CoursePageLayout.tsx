import { Layout, Spin } from 'antd';
import { useContext } from 'react';
import { CourseNoAccess } from '../modules/Course/components/CourseNoAccess';
import { Header } from './Header';
import { SessionAndCourseContext } from 'modules/Course/contexts';

type Props = { loading: boolean; title?: string; children?: any };

export function CoursePageLayout(props: Props) {
  const { activeCourse } = useContext(SessionAndCourseContext);

  if (activeCourse == null) {
    return <CourseNoAccess />;
  }
  return (
    <Layout style={{ background: 'transparent' }}>
      <Header title={props.title} showCourseName={true} />
      <Layout.Content style={{ margin: 16 }}>
        <Spin spinning={props.loading}>{props.children}</Spin>
      </Layout.Content>
    </Layout>
  );
}
