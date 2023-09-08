import { Layout, Spin } from 'antd';
import { CourseNoAccess } from '../modules/Course/components/CourseNoAccess';
import { Header } from './Header';
import { Course } from 'services/models';

type Props = { loading: boolean; title?: string; children?: any; course: Course };

export function CoursePageLayout(props: Props) {
  const { activeCourse } = useContext(SessionContext);

  if (activeCourse == null) {
    return <CourseNoAccess />;
  }
  return (
    <Layout style={{ background: 'transparent' }}>
      <Header title={props.title} showCourseName={true} course={props.course} />
      <Layout.Content style={{ margin: 16 }}>
        <Spin spinning={props.loading}>{props.children}</Spin>
      </Layout.Content>
    </Layout>
  );
}
