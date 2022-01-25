import { Layout, Spin } from 'antd';
import { Course } from 'services/models';
import { CourseNoAccess } from '../modules/Course/components/CourseNoAccess';
import { Header } from './Header';

type Props = { loading: boolean; githubId: string; course: Course; title?: string; children?: any };

export function CoursePageLayout(props: Props) {
  if (props.course == null) {
    return <CourseNoAccess />;
  }
  return (
    <Layout style={{ background: 'transparent' }}>
      <Header title={props.title} username={props.githubId} courseName={props.course.name} />
      <Layout.Content style={{ margin: 16 }}>
        <Spin spinning={props.loading}>{props.children}</Spin>
      </Layout.Content>
    </Layout>
  );
}
