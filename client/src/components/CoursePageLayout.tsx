import { Layout, Spin } from 'antd';
import { CourseNoAccess } from '../modules/Course/components/CourseNoAccess';
import { Header } from './Header';
import { Course } from 'services/models';

type Props = { loading: boolean; title?: string; children?: any; course: Course };

export function CoursePageLayout(props: Props) {
  if (props.course == null) {
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
