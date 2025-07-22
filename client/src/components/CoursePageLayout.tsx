import { Layout, Spin, theme } from 'antd';
import { Course } from 'services/models';
import { CourseNoAccess } from '../modules/Course/components/CourseNoAccess';
import { Header } from './Header';

type Props = {
  loading: boolean;
  githubId: string;
  course: Course;
  title?: string;
  children?: any;
  showCourseName?: boolean;
};

export function CoursePageLayout(props: Props) {
  const { token } = theme.useToken();

  if (props.course == null) {
    return <CourseNoAccess />;
  }

  return (
    <Layout style={{ minHeight: '100vh', background: token.colorBgContainer }}>
      <Header title={props.title} showCourseName={props.showCourseName} />
      <Layout.Content style={{ margin: 16 }}>
        <Spin spinning={props.loading}>{props.children}</Spin>
      </Layout.Content>
    </Layout>
  );
}
